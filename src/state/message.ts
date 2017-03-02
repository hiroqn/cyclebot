import {User} from './user';

export type ChannelLike = {
    id: string;
}

export type IncomingMessage<T extends ChannelLike> = {
    channel: T;
    channel_id: string;
    user: User;
    user_id: string;
    text: string;
    ts: string;
};

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
