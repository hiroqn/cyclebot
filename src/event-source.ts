import {Observable} from 'rxjs';
import {Status} from './state/status';
import {empty} from 'rxjs/observable/empty';
import {of} from 'rxjs/observable/of';
import {IncomingMessage} from './state/message';
import {Channel} from './state/channel';
import {InstantMessage} from './state/ims';

type O<T> = Observable<T>;

export class EventSource {

    private _message$: O<{event: IncomingMessage}>;

    constructor(_status$: O<Status>) {
        const [, message$] = _status$.partition(status => typeof status.event === 'string');

        this._message$ = message$ as O<{event: IncomingMessage}>;
    }

    selectByName(_name: string) {
        const name = _name.slice(1);
        switch (_name.charAt(0)) {
            case '#':
                return this._message$
                    .mergeMap(({event}) => {
                    //TODO DMの処理
                        if ((event.channel as Channel).name === name && !event.user.is_bot) {
                            return of(event);

                        } else {
                            return empty();
                        }
                    });
            case '@':
                return this._message$
                    .mergeMap(({event}) => {
                        if ((event.channel as InstantMessage).user === name && !event.user.is_bot) {
                            return of(event);

                        } else {
                            return empty();
                        }
                    });
            default:
                return empty()
        }
    }
}
