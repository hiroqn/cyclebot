import {
    assoc,
    lensProp,
    merge,
    over,
} from 'ramda';
import {Event, Message} from './event';
import {Dictionary, empty, fromArray, insertC, lookup, modifyC, removeC, values} from 'jazz-func/dictionary';
import {Channel} from './channel';
import {InstantMessage} from './instant-message';
import {User} from './user';
import {Endo, id} from 'jazz-func/endo';
import {Response} from './parser/api-rtm-starts-parser';

export type Environment = {
    channels: Dictionary<Channel>;
    instantMessages: Dictionary<InstantMessage>;
    users: Dictionary<User>;
}

export function Environment(): Environment {
    return {
        channels: empty(),
        instantMessages: empty(),
        users: empty(),
    };
};

export function fromResponse(response: Response): Environment {
    return {
        channels: fromArray(response.channels.map<[string, Channel]>(x => [x.id, x])),
        instantMessages: fromArray(response.ims.map<[string, InstantMessage]>(x => [x.id, x])),
        users: fromArray(response.users.map<[string, User]>(x => [x.id, x])),
    }
}

export function makeMessageAction(event: Message): Endo<Environment> {
    if (!event.subtype) {
        const {text, user: user_id, channel: channel_id, ts} = event;

        switch (channel_id.charAt(0)) {
            case 'D':
                return (state) => {
                    const user = lookup(user_id, state.users);
                    const channel = lookup(channel_id, state.instantMessages);
                    if (!user || !channel) {
                        return assoc('event', 'noop', state)
                    }
                    return assoc('event', {
                        user,
                        user_id,
                        channel,
                        channel_id,
                        text,
                        ts
                    }, state);
                };
            case 'C':
                return (state) => {
                    const user = lookup(user_id, state.users);
                    const channel = lookup(channel_id, state.channels);
                    if (!user || !channel) {
                        return assoc('event', 'noop', state)
                    }
                    return assoc('event', {
                        user,
                        user_id,
                        channel,
                        channel_id,
                        text,
                        ts
                    }, state)
                };
        }
    }

    switch (event.subtype) {
        case 'bot_message':
        case 'channel_archive':
        case 'channel_join':
        case 'channel_leave':
        case 'channel_name':
        case 'channel_purpose':
        case 'channel_topic':
        case 'channel_unarchive':
        case 'file_comment':
        case 'file_mention':
        case 'file_share':
        case 'group_archive':
        case 'group_join':
        case 'group_leave':
        case 'group_name':
        case 'group_purpose':
        case 'group_topic':
        case 'group_unarchive':
        case 'me_message':
        case 'message_changed':
        case 'message_deleted':
        case 'pinned_item':
        case 'unpinned_item':
            return assoc('event', event.subtype);

        default:
            return id;
    }
}

export function makeEnvironmentAction(event: Event): Endo<Environment> {
    switch (event.type) {
        case 'channel_created':
          return createChannel(merge({is_member: false, is_archived: false}, event.channel));

        case 'channel_archive':
            return updateChannel(event.channel, assoc('is_archived', true));

        case 'channel_unarchive':
            return updateChannel(event.channel, assoc('is_archived', false));

        case 'channel_deleted':
            return deleteChannel(event.channel);

        case 'channel_joined':
            return updateChannel(event.channel.id, assoc('is_member', true));

        case 'channel_left':
            return updateChannel(event.channel, assoc('is_member', false));

        case 'message':
            return makeMessageAction(event);

        case 'presence_change':
            Array.isArray(event.users) ? id :
              updateUser(event.user, assoc('presence', event.presence));

        default:
            return id;
    }
}

function findOne<T>(predicate: (x: T) => boolean, dict: Dictionary<T>): T | undefined {
    return values(dict).find(predicate);
}

function createChannel(x: Channel): Endo<Environment> {
    return over(lensProp('channels'), insertC(x.id)(x));
}

function updateChannel(key: string, project: (x: Channel) => Channel): Endo<Environment> {
    return over(lensProp('channels'), modifyC(key)(project));
}

function deleteChannel(key: string): Endo<Environment> {
    return over(lensProp('channels'), removeC(key));
}

function updateUser(key: string, project: (x: User) => User): Endo<Environment> {
    return over(lensProp('users'), modifyC(key)(project));
}

export function findIdByName(_name: string, env: Environment): string | null {
    const name = _name.slice(1);
    switch (_name.charAt(0)) {
        case '#':
            const channel = findOne(channel => name === channel.name, env.channels);
            return channel ? channel.id : null;
        case '@':
            const user = findOne(user => name === user.name, env.users);
            if (!user) {
                return null;
            }
            const im = findOne(ims => user.id === ims.user, env.instantMessages);

            return im ? im.id : null;
        default:
            return null;
    }
}
