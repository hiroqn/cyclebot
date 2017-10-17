import {
    identity,
    merge,
    where,
    is,
    both,
    all,
    pipe,
    assoc
} from 'ramda';
import {Action, EventLike, createChannel, updateChannel, deleteChannel, updateUser} from '../state/status';
import {channelArchived, channelUnarchived, channelJoined, channelLeft} from '../state/channel';
import {isArray} from 'rxjs/util/isArray';
import {findByKey} from "../util/map";

type SlackLikeEvent = {
    type: string;
    subtype?: string;
}

function makeMessageAction(event: any & SlackLikeEvent): Action<EventLike> {// TODO i dont know this type declare is correct....

    if (!event.subtype) {

        const {text, user: user_id, channel: channel_id, ts} = event;

        switch (channel_id.charAt(0)) {
            case 'D':
                return (state) => {
                    const user = findByKey(user_id, state.users);
                    const channel = findByKey(channel_id, state.ims);
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
                    const user = findByKey(user_id, state.users);
                    const channel = findByKey(channel_id, state.channels);
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

function makeStatusAction(event: any): Action<EventLike> {

    switch (event.type) {
        case 'channel_created':
            return isChannelCreated(event) ?
                createChannel(merge({is_member: false, is_archived: false}, event.channel)) :
                identity;

        case 'channel_archive':
            return isChannelArchived(event) ?
                updateChannel(event.channel, channelArchived) :
                identity;

        case 'channel_unarchive':
            return isChannelArchived(event) ?
                updateChannel(event.channel, channelUnarchived) :
                identity;

        case 'channel_deleted':
            return isChannelDeleted(event) ?
                deleteChannel(event.channel) :
                identity;

        case 'channel_joined':
            return isChannelJoined(event) ?
                updateChannel(event.channel.id, channelJoined) :
                identity;

        case 'channel_left':
            return isChannelLeft(event) ?
                updateChannel(event.channel, channelLeft) :
                identity;

        case 'presence_change':
            return isPresenceChange(event) ?
                updateUser(event.user, assoc('presence', event.presence)) :
                identity;

        default:
            return identity;
    }
}

export function parser(slackEvent: any): Action<EventLike> {
    if (slackEvent.type === 'message') {
        return makeMessageAction(slackEvent);
    } else {
        return pipe((assoc('event', slackEvent.type)), makeStatusAction(slackEvent));
    }
}
