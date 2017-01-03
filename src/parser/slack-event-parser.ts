import {
    ifElse,
    identity,
    propEq,
    lensProp,
    over,
    append,
    merge,
    map,
    reject,
    where,
    is,
    both,
    all,
    pipe,
    assoc
} from 'ramda';
import {Action} from '../state/status';
import {channelArchived, channelUnarchived, channelJoined, channelLeft} from '../state/channel';
import {isArray} from 'rxjs/util/isArray';

type SlackLikeEvent = {
    type: string;
    subtype?: string;
}

function makeMessageAction(event: any & SlackLikeEvent): Action {

    if (!event.subtype) {

        const {text, user, channel, ts} = event;

        switch (channel.charAt(0)) {
            case 'D':
                return (state) => {
                    return assoc('event', {
                        user: state.users.find(u => u.id === user),
                        user_id: user,
                        channel: state.ims.find(im => im.id === channel),
                        channel_id: channel,
                        text,
                        ts
                    }, state)
                };
            case 'C':
                return (state) => {
                    return assoc('event', {
                        user: state.users.find(u => u.id === user),
                        user_id: user,
                        channel: state.channels.find(ch => ch.id === channel),
                        channel_id: channel,
                        text,
                        ts
                    }, state)
                };
        }
    }

    switch (event.subtype) {
        case 'bot_message' :
        case 'channel_archive' :
        case 'channel_join' :
        case 'channel_leave' :
        case 'channel_name' :
        case 'channel_purpose' :
        case 'channel_topic' :
        case 'channel_unarchive' :
        case 'file_comment' :
        case 'file_mention' :
        case 'file_share' :
        case 'group_archive' :
        case 'group_join' :
        case 'group_leave' :
        case 'group_name' :
        case 'group_purpose' :
        case 'group_topic' :
        case 'group_unarchive' :
        case 'me_message' :
        case 'message_changed' :
        case 'message_deleted' :
        case 'pinned_item' :
        case 'unpinned_item' :
            return assoc('event', event.subtype);

        default:
            return identity;
    }
}

type ChannelCreatedEvent = {
    type: 'channel_created';
    channel: {
        id: string;
        name: string;
        created: number;
        creator: string;
    }
};

const isChannelCreated = where({
    channel: where({
        id: is(String),
        name: is(String),
        created: is(Number),
        creator: is(String)
    })
}) as (e: any) => e is ChannelCreatedEvent;

type ChannelArchiveEvent = {
    type: 'channel_archive' | 'channel_unarchive';
    channel: string;
    user: string;
};

const isChannelArchived = where({
    channel: is(String),
    user: is(String)
}) as (e: any) => e is ChannelArchiveEvent;

type ChannelDeletedEvent = {
    type: 'channel_deleted' | 'channel_left';
    channel: string;
};

const isChannelDeleted = where({
    channel: is(String)
}) as (e: any) => e is ChannelDeletedEvent;

type ChannelJoinedEvent = {
    type: 'channel_joined';
    channel: {
        id: string;
        name: string;
        members: string[];
        created: number;
        creator: string;
    }
};

const isChannelJoined = where({
    channel: where({
        id: is(String),
        name: is(String),
        members: both(isArray, all(is(String)))
    })
}) as (e: any) => e is ChannelJoinedEvent;

const isChannelLeft = isChannelDeleted;

type PresenceChangeEvent = {
    type: 'presence_change';
    presence: 'active' | 'away';
    user: string;
};

const isPresenceChange = where({
    presence: is(String),
    user: is(String)
}) as (e: any) => e is PresenceChangeEvent;

function makeStatusAction(event: any): Action {

    switch (event.type) {
        case 'channel_created':
            return isChannelCreated(event) ? over(lensProp('channels'), append(merge({
                is_member: false,
                is_archived: false
            }, event.channel))) : identity;

        case 'channel_archive':
            return isChannelArchived(event) ?
                over(lensProp('channels'), map(ifElse(propEq('id', event.channel), channelArchived, identity))) : identity;

        case 'channel_unarchive':
            return isChannelArchived(event) ?
                over(lensProp('channels'), map(ifElse(propEq('id', event.channel), channelUnarchived, identity))) : identity;

        case 'channel_deleted':
            return isChannelDeleted(event) ? over(lensProp('channels'), reject(propEq('id', event.channel))) : identity;

        case 'channel_joined':
            return isChannelJoined(event) ?
                over(lensProp('channels'), map(ifElse(propEq('id', event.channel.id), channelJoined, identity))) : identity;

        case 'channel_left':
            return isChannelLeft(event) ?
                over(lensProp('channels'), map(ifElse(propEq('id', event.channel), channelLeft, identity))) : identity;

        case 'presence_change':
            return isPresenceChange(event) ?
                over(lensProp('users'), map(ifElse(propEq('id', event.user), assoc('presence', event.presence), identity))) : identity;
        default:
            return identity;
    }
}

export function parser(slackEvent: any): Action {
    if (slackEvent.type === 'message') {
        return makeMessageAction(slackEvent);
    } else {
        return pipe((assoc('event', slackEvent.type) as Action), makeStatusAction(slackEvent));
    }
}
