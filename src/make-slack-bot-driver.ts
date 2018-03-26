import ms = require('ms');
import * as WebSocket from 'ws';
import {always, contains} from 'ramda';
import {Endo} from 'jazz-func/endo';
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
import {Event} from './event';
import {Request} from "./request";
import {Environment, makeEnvironmentAction, fromResponse, findIdByName} from './environment';

type O<T> = Observable<T>;

export type SlackBotSource = {
    event: Observable<Event>;
    environment: Observable<Environment>;
}

export type makeBotDriverOptions = {
    pingInterval?: number;
    pingRetryLimit?: number;
}

export type Connection = {
    socket: WebSocket;
    environment: Environment;
}

function send(id: number, request: Request, {socket, environment}: Connection) {

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
            const userId = findIdByName(name, environment);
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

    function connectSocket(response: Response): O<Connection> {
        return new Observable<Connection>((observer: Subscriber<Connection>) => {
            const socket = new WebSocket(response.url);

            const ping$: O<Timestamp<number>> = fromEvent(socket, 'open').take(1)
                .switchMap((_) => interval(pingInterval).startWith(0))
                .timestamp()
                .share();

            const pong$: O<Timestamp<{}>> = fromEvent(socket, 'pong')
                .timestamp();

            const pingOutput$ = ping$.mapTo(() => socket.ping(null, true));
            const pongOutput$ = fromEvent(socket, 'ping').mapTo(() => socket.pong());
            const terminateOutput$ = ping$.withLatestFrom(pong$, (ping, pong) => ping.timestamp - pong.timestamp)
                .filter(diff => diff > pingInterval * (pingRetryLimit - 0.5))
                .mapTo(() => socket.terminate()).take(1);

            const subscription = merge(pingOutput$, pongOutput$, terminateOutput$).subscribe(f => f());

            socket
                .on('open', () => observer.next({
                    socket,
                    environment: fromResponse(response)
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

    return function botDriver(xout$: O<Request>): SlackBotSource {
        const out$ = from(xout$);
        const params = {
            simple_latest: true,
            no_unreads: true,
            token
        };

        const response$ = fetchSlackApi<Response>('rtm.start', params, apiParser).retryWhen(makeRetryNotifier);

        const connection$: Observable<Connection> = response$.switchMap(connectSocket).share();
        const socket$: Observable<WebSocket> = connection$.map(({socket}) => socket);
        const event$: Observable<Event> = socket$
            .switchMap((socket: WebSocket) =>
                fromEvent(socket, 'message').map(({data}) => data)
                    .mergeMap<string, Event>(jsonLikeString => {
                        try {
                            const event = JSON.parse(jsonLikeString);

                            if (contains(event.type, [undefined, 'reconnect_url', 'desktop_notification', 'hello']) || event.reply_to) {
                                return empty();
                            }

                            return of(event);
                        } catch (e) {
                            return empty();
                        }
                    })
                );

        const environment$: Observable<Environment> = Observable.merge<Endo<Environment>>(
            connection$.map(({environment}) => always(environment)),
            event$.map(makeEnvironmentAction)
        ).scan((acc, x) => x(acc), Environment());

        let id = 0;

        out$.withLatestFrom(event$, environment$, socket$)        //TODO subscription handling
            .subscribe(([outgoing, _, environment, socket]) => {
                id += 1;
                send(id, outgoing, { environment, socket });
            });

        return {
            event: event$,
            environment: environment$,
        };
    }
}
