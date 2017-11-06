import {Observable} from 'rxjs';
import {Status, AnyStatus} from './state/status';
import {empty} from 'rxjs/observable/empty';
import {of} from 'rxjs/observable/of';
import {IncomingMessage} from './state/message';
import {Channel, isChannel} from './state/channel';
import {InstantMessage, isInstantMessage} from './state/ims';
import {findOne} from './util/map'
import {GroupedObservable} from 'rxjs/operator/groupBy';
type O<T> = Observable<T>;
type NonStringStatus = Status<IncomingMessage<Channel> | IncomingMessage<InstantMessage>>;
type ChanStatus = Status<IncomingMessage<Channel>>;
type IMStatus = Status<IncomingMessage<InstantMessage>>;

export class EventSource {

    private _message$: O<NonStringStatus>;

    constructor(_status$: Observable<AnyStatus>) {
        const message$ = _status$.filter((status: AnyStatus): status is NonStringStatus => typeof status.event !== 'string');

        this._message$ = message$;
    }

    groupByChannel(): Observable<GroupedObservable<string, IncomingMessage<Channel>>> {
        return this._message$
            .filter<NonStringStatus, ChanStatus>((ps: NonStringStatus): ps is ChanStatus => isChannel(ps.event.channel))
            .map(x => x.event)
            .groupBy((x: IncomingMessage<Channel>) => x.channel_id)
    }

    selectByChannelName(name: string): Observable<IncomingMessage<Channel>> {
        return this._message$.filter<NonStringStatus, ChanStatus>((ps: NonStringStatus): ps is ChanStatus => isChannel(ps.event.channel)).mergeMap(({event, channels}) => {
            const channel = findOne(channel => name === channel.name, channels);
            if (channel && !event.user.is_bot) {
                return of(event);
            } else {
                return empty();
            }
        });
    }

    selectByUserName(name: string): Observable<IncomingMessage<InstantMessage>> {
        return this._message$.filter<NonStringStatus, IMStatus>((ps: NonStringStatus): ps is IMStatus => isInstantMessage(ps.event.channel)).mergeMap(({users, event, ims}) => {
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
