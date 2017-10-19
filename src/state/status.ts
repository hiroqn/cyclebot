import {
    lensProp,
    over,
    curry
} from 'ramda';

import {User} from './user';
import {Channel} from './channel';
import {IncomingMessage} from './message';
import {InstantMessage} from './ims';
import {Response} from "../parser/api-rtm-starts-parser";
import {Map, fromArray, update, create, del, findOne} from "../util/map";

export type EventLike = string | IncomingMessage<Channel> | IncomingMessage<InstantMessage>;

export type Status<T extends EventLike> = {
    users: Map<User>;
    channels: Map<Channel>;
    ims: Map<InstantMessage>;
    event: T;
};

export type AnyStatus = Status<EventLike>;

function getKey(x: {id: string}): string {
    return x.id;
}

export function fromResponse(response: Response): Status<string> {
    return {
        users: fromArray(response.users, getKey),
        channels: fromArray(response.channels, getKey),
        ims: fromArray(response.ims, getKey),
        event: 'hello'
    }
}

export type Action<T extends EventLike> = (s: Status<T>) => Status<T>;

const curryUpdate = curry(update);
const curryCreate = curry(create);
const curryDel = curry(del);

export function createChannel<T extends EventLike>(x: Channel): Action<T> {
    return over(lensProp('channels'), curryCreate(getKey, x));
}

export function updateChannel<T extends EventLike>(key: string, project: (x: Channel) => Channel): Action<T> {
    return over(lensProp('channels'), curryUpdate(key, project));
}

export function deleteChannel<T extends EventLike>(key: string): Action<T> {
    return over(lensProp('channels'), curryDel(key));
}

export function updateUser<T extends EventLike>(key: string, project: (x: User) => User): Action<T> {
    return over(lensProp('users'), curryUpdate(key, project));
}

export function findIdByName<T extends EventLike>(_name: string, status: Status<T>): string | null {
    const name = _name.slice(1);
    switch (_name.charAt(0)) {
        case '#':
            const channel = findOne(channel => name === channel.name, status.channels);
            return channel ? channel.id : null;
        case '@':
            const user = findOne(user => name === user.name, status.users);
            if (!user) {
                return null;
            }
            const im = findOne(ims => user.id === ims.user, status.ims);

            return im ? im.id : null;
        default:
            return null;
    }
}
