import {User} from './user';
import {Channel} from './channel';
import {IncomingMessage} from './message';
import {InstantMessage} from './ims';

export type Status = {
    users: User[];
    channels: Channel[];
    ims: InstantMessage[];
    event: string | IncomingMessage;
};

export type Action = (s: Status) => Status;
