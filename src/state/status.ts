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

export type Status = {
    users: Map<User>;
    channels: Map<Channel>;
    ims: Map<InstantMessage>;
    event: string | IncomingMessage<Channel> | IncomingMessage<InstantMessage>;
};

export type PartialStatus<T extends (string | IncomingMessage<Channel> | IncomingMessage<InstantMessage>)> = {
    users: Map<User>;
    channels: Map<Channel>;
    ims: Map<InstantMessage>;
    event: T;
};

function getKey(x: {id: string}): string {
    return x.id;
}

export function fromResponse(response: Response): Status {
    return {
        users: fromArray(response.users, getKey),
        channels: fromArray(response.channels, getKey),
        ims: fromArray(response.ims, getKey),
        event: 'hello'
    }
}

export type Action = (s: Status) => Status;

const curryUpdate = curry(update);
const curryCreate = curry(create);
const curryDel = curry(del);

export function createChannel(x: Channel): Action {
    return over(lensProp('channels'), curryCreate(getKey, x));
}

export function updateChannel(key: string, project: (x: Channel) => Channel): Action {
    return over(lensProp('channels'), curryUpdate(key, project));
}

export function deleteChannel(key: string): Action {
    return curryDel(key);
}

export function updateUser(key: string, project: (x: User) => User): Action {
    return over(lensProp('users'), curryUpdate(key, project));
}

export function findIdByName(_name: string, status: Status): string | null {
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
