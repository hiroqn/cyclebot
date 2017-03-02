import {Observable} from 'rxjs';
import {Status, PartialStatus} from './state/status';
import {empty} from 'rxjs/observable/empty';
import {of} from 'rxjs/observable/of';
import {IncomingMessage} from './state/message';
import {Channel} from './state/channel';
import {InstantMessage} from './state/ims';
import {findOne} from './util/map'
type O<T> = Observable<T>;

export class EventSource {

    private _message$: O<PartialStatus<IncomingMessage<Channel> | IncomingMessage<InstantMessage>>>;

    constructor(_status$: Observable<Status>) {
        const [, message$] = _status$.partition(status => typeof status.event === 'string');

        this._message$ = message$ as O<PartialStatus<IncomingMessage<Channel> | IncomingMessage<InstantMessage>>>;
    }

    selectByChannelName(name: string): Observable<IncomingMessage<Channel>> {
        return this._message$.mergeMap(({event, channels}) => {
            const channel = findOne(channel => name === channel.name, channels);
            if (channel && !event.user.is_bot) {
                return of(event);
            } else {
                return empty();
            }
        });
    }

    selectByUserName(name: string): Observable<IncomingMessage<InstantMessage>> {
        return this._message$.mergeMap(({users, event, ims}) => {
            const user = findOne(user => name === user.name, users);
            if (!user) {
                return empty();
            }
            const im = findOne(ims => user.id === ims.user, ims);

            if (!im || event.user.is_bot) {
                return empty();

            } else {
                return of(event);
            }
        });
    }
}
