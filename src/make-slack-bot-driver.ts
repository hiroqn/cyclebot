import * as ms from 'ms';
import * as WebSocket from 'ws';
import {contains} from 'ramda';
/**
 * rxjs
 */
import {Observable, Timestamp, Scheduler, Subscriber} from 'rxjs';
import {of} from 'rxjs/observable/of';
import {zip} from 'rxjs/observable/zip';
import {range} from 'rxjs/observable/range';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {interval} from 'rxjs/observable/interval';
import {empty} from 'rxjs/observable/empty';
import {merge} from "rxjs/observable/merge";
import {from} from "rxjs/observable/from";

/**
 * local
 */
import {fetchSlackApi} from './fetch-slack-api';
import {parser as apiParser, Response} from './parser/api-rtm-starts-parser';
import {parser as eventParser} from './parser/slack-event-parser';
import {EventSource} from './event-source';
import {Status, Action, findIdByName, fromResponse} from './state/status';
import {Request} from "./request";

type O<T> = Observable<T>;

export type makeBotDriverOptions = {
    pingInterval?: number;
    pingRetryLimit?: number;
}

export type Connection = {
    socket: WebSocket,
    status: Status
}

function send(id: number, request: Request, {socket, status}: Connection) {

    switch (request.type) {
        case  'message-by-id':
            socket.send(JSON.stringify({
                id,
                type: 'message',
                channel: request.id,
                text: `${request.text}`
            }));
            return;
        case  'message-by-name':
            const userId = findIdByName(name, status);
            if (userId) {

                socket.send(JSON.stringify({
                    id,
                    type: 'message',
                    channel: userId,
                    text: `${request.text}`
                }));
            }
            return;
    }
}

export function makeSlackBotDriver(token: string, options?: makeBotDriverOptions) {

    const {pingInterval = ms('10s'), pingRetryLimit = 2} = options || {};

    function connectSocket(status: Response): O<Connection> {
        return new Observable<Connection>((observer: Subscriber<Connection>) => {
            const socket = new WebSocket(status.url);

            const ping$: O<Timestamp<number>> = fromEvent(socket, 'open').take(1)
                .switchMap((_) => interval(pingInterval).startWith(0))
                .timestamp()
                .share();

            const pong$: O<Timestamp<{}>> = fromEvent(socket, 'pong')
                .timestamp();

            const pingOutput$ = ping$.mapTo(() => socket.ping(null, {}, true));
            const pongOutput$ = fromEvent(socket, 'ping').mapTo(() => socket.pong());
            const terminateOutput$ = ping$.withLatestFrom(pong$, (ping, pong) => ping.timestamp - pong.timestamp)
                .filter(diff => diff > pingInterval * (pingRetryLimit - 0.5))
                .mapTo(() => socket.terminate()).take(1);

            const subscription = merge(pingOutput$, pongOutput$, terminateOutput$).subscribe(f => f());

            socket
                .on('open', () => observer.next({
                    socket,
                    status: fromResponse(status)
                }))
                .on('error', (error: any) => observer.error(error))
                .on('close', () => observer.complete());

            return () => {
                subscription.unsubscribe();
                socket.close();
            }
        });
    }

    function makeRetryNotifier(error$: O<Error>): O<any> {
        return zip(error$, range(0, Infinity, Scheduler.async))
            .mergeMap(([error, retry]: [Error, number]) => {
                if ((error.message || '').startsWith('TooManyRequests')) {
                    return interval(Number(error.message.split(':')[1])).take(1)
                }

                if (error.message === 'invalid_auth') {
                    return interval(ms('1h')).take(1);
                }

                return interval(Math.max(retry * 1000, ms('3m'))).take(1);
            });
    }

    return function botDriver(xout$: O<Request>) {
        const out$ = from(xout$);
        const params = {
            simple_latest: true,
            no_unreads: true,
            token
        };

        const response$ = fetchSlackApi<Response>('rtm.start', params, apiParser).retryWhen(makeRetryNotifier);

        const status$ = response$.switchMap(connectSocket)
            .switchMap(({socket, status}) =>
                (<O<string>>fromEvent(socket, 'message'))
                    .mergeMap((jsonLikeString: string): O<Action> => {
                        try {
                            const event = JSON.parse(jsonLikeString);

                            if (contains(event.type, [undefined, 'reconnect_url', 'desktop_notification', 'hello']) || event.reply_to) {
                                return empty();
                            }

                            return of(eventParser(event));
                        } catch (e) {
                            return empty();
                        }
                    })
                    .scan((state, action) => action(state), status)
                    .map((status: Status) => ({status, socket}))).share();

        let id = 0;

        out$.withLatestFrom(status$)        //TODO subscription handling
            .subscribe(([outgoing, conn]) => {
                id += 1;
                send(id, outgoing, conn);
            });

        return new EventSource(status$.map(({status}) => status));
    }
}
