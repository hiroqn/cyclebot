import {Observable} from 'rxjs';
import {Status} from './state/status';
import {empty} from 'rxjs/observable/empty';
import {of} from 'rxjs/observable/of';
import {IncomingMessage} from './state/message';
import {Channel} from './state/channel';
import {InstantMessage} from './state/ims';
import {User} from "./state/user";

type O<T> = Observable<T>;

export class EventSource {

    private _message$: O<{
        users: User[];
        channels: Channel[];
        ims: InstantMessage[];
        event: IncomingMessage;
    }>;

    constructor(_status$: Observable<Status>) {
        const [, message$] = _status$.partition(status => typeof status.event === 'string');

        this._message$ = message$ as O<{event: IncomingMessage}>;
    }

    selectByChannelName(name: string) {
        return this._message$.mergeMap(({event}) => {
            if ((event.channel as Channel).name === name && !event.user.is_bot) {
                return of(event);
            } else {
                return empty();
            }
        });
    }

    selectByUserName(name: string) {
        return this._message$.mergeMap(({users, event}) => {
            const user = users.find(u => u.name === name);
            if (!user) {
                return empty();
            }
            if ((event.channel as InstantMessage).user === user.id && !event.user.is_bot) {
                return of(event);
            } else {
                return empty();
            }
        });
    }
}
