import * as ms from 'ms';
import * as WebSocket from 'ws';
import {Observable, Timestamp, Scheduler, Subscriber} from 'rxjs';
import {of} from 'rxjs/observable/of';
import {zip} from 'rxjs/observable/zip';
import {range} from 'rxjs/observable/range';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {interval} from 'rxjs/observable/interval';
import {fetchSlackApi} from './fetch-slack-api';
import {parser as apiParser, Response} from './parser/api-rtm-starts-parser';
import {parser as eventParser} from './parser/slack-event-parser';
import {EventSource} from './event-source';
import {Status, Action} from './state/status';
import {empty} from 'rxjs/observable/empty';
import {contains} from 'ramda';
import {OutgoingMessage, IncomingMessage} from './state/message';

type O<T> = Observable<T>;

type makeBotDriverOptions = {
    pingInterval?: number;
    pingRetryLimit?: number;
}

export type Connection = {
    socket: WebSocket,
    status: Status
}

export function reply(message: IncomingMessage, text: string): OutgoingMessage {
    return {
        text,
        channel: message.channel.id
    }
}

export function makeSlackBotDriver(token: string, {pingInterval = ms('10s'), pingRetryLimit = 2}: makeBotDriverOptions) {

    function connectSocket(status: Response): O<Connection> {
        return new Observable<Connection>((observer: Subscriber<Connection>) => {
            const socket = new WebSocket(status.url);

            const ping$: O<Timestamp<number>> = fromEvent(socket, 'open').take(1)
                .switchMap((_) => interval(pingInterval).startWith(0))
                .timestamp()
                .share();

            const pong$: O<Timestamp<{}>> = fromEvent(socket, 'pong')
                .timestamp();

            const subscription = ping$.withLatestFrom(pong$, (ping, pong) => ping.timestamp - pong.timestamp)
                .filter(diff => diff > pingInterval * (pingRetryLimit - 0.5))
                .take(1)
                .subscribe(() => socket.terminate())
                .add(ping$.subscribe(() => socket.ping(null, {}, true)))
                .add(fromEvent(socket, 'ping').subscribe(() => socket.pong()));

            socket
                .on('open', () => observer.next({
                    socket,
                    status: {
                        users: status.users,
                        channels: status.channels,
                        ims: status.ims,
                        event: 'hello'
                    }
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

    return function botDriver(out$: O<OutgoingMessage>) {

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

                            /**
                             *
                             *
                             *
                             *
                             *
                             */
                            console.log(event);

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

        out$.withLatestFrom(status$)
            .subscribe(([outgoing, {socket}]) => {
                const {text, channel} = outgoing;
                id += 1;
                console.log(outgoing)
                socket.send(JSON.stringify({
                    id,
                    type: 'message',
                    channel: channel,
                    text: `${text}`
                }));
            });

        return new EventSource(status$.map(({status}) => status));
    }
}
