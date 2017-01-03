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

export function findIdByName(status: Status, _name: string): string | null {
    const name = _name.slice(1);
    switch (_name.charAt(0)) {
        case '#':
            const channel = status.channels.find(ch => ch.name === name);
            return channel ? channel.id : null;
        case '@':
            const user = status.users.find(u => u.name === name);
            if (!user) {
                return null;
            }
            const ims = status.ims.find(ims => ims.user === user.id);
            return ims ? ims.id : null;
        default:
            return null;
    }
}
