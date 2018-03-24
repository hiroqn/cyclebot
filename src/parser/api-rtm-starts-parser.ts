import {where, ifElse, is, both, all, pick, pipe, over, lensProp, map} from 'ramda';
import {isArray} from 'rxjs/util/isArray';
import {Channel, isChannel, makeChannel} from '../channel';
import {isUser, User, makeUser} from '../user';
import {InstantMessage, makeInstantMessage, isInstantMessage} from '../instant-message';

export type Response = {
    url: string;
    users: User[];
    channels: Channel[];
    ims: InstantMessage[]
};

const isSuccess = where({
    ok: Boolean,
    url: is(String),
    users: both(isArray, all(isUser)),
    channels: both(isArray, all(isChannel)),
    ims: both(isArray, all(isInstantMessage))
});

export const parser: (json: any) => Response | null = ifElse(isSuccess, pipe(
    pick(['url', 'channels', 'users', 'ims']),
    over(lensProp('users'), map(makeUser)),
    over(lensProp('channels'), map(makeChannel)),
    over(lensProp('ims'), map(makeInstantMessage))
), () => null);
