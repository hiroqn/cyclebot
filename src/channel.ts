import {pick} from 'ramda';

export type Channel = {
    id: string;
    name: string;
    is_member: boolean;
    is_archived: boolean;
    created: number;
    creator: string;
}

export function isChannel(x: any): x is Channel {
    return typeof x === 'object' &&
        x !== null &&
        typeof x.id === 'string' &&
        typeof x.name === 'string' &&
        typeof x.is_member === 'boolean' &&
        typeof x.is_archived === 'boolean' &&
        typeof x.created === 'number' &&
        typeof x.creator === 'string';
};

const channelKeyList: Array<keyof Channel> = [
    'id',
    'name',
    'is_member',
    'is_archived',
    'created',
    'creator'
];

export const makeChannel = pick(channelKeyList);
