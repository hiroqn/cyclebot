import {Channel} from './channel';
import {User} from './user';
import {InstantMessage} from './ims';

export type IncomingMessage = {
    channel: Channel | InstantMessage;
    channel_id: string;
    user: User;
    user_id: string;
    text: string;
    ts: string;
};

export type OutgoingMessage = {
    channel?: string;
    name?: string;
    text: string;
}

export type MessageChanged = {
    message: {
        text: string;
        ts: string;
        user: string;
        edited: {
            user: string;
            ts: string;
        }
    },
    hidden: boolean,
    channel: string,
    previous_message: {
        text: string;
        ts: string;
        user: string;
    },
    event_ts: string;
    ts: string;
}

export type MessageExtension = {
    is_starred?: true;
    pinned_to?: string[];
    reactions?: {
        name: string;
        count: number;
        users: string[];
    }[];
}
