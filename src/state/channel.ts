import {where, is, pick, assoc} from 'ramda';

export type Channel = {
    id: string;
    name: string;
    is_member: boolean;
    is_archived: boolean;
    created: number;
    creator: string;
}

export const isChannel = where({
    id: is(String),
    name: is(String),
    is_member: is(Boolean),
    is_archived: is(Boolean),
    created: is(Number),
    creator: is(String)
});

const channelKeyList: Array<keyof Channel> = [
    'id',
    'name',
    'is_member',
    'is_archived',
    'created',
    'creator'
];

export const makeChannel = pick(channelKeyList);

export const channelArchived = assoc('is_archived', true);
export const channelUnarchived = assoc('is_archived', false);

export const channelJoined = assoc('is_member', true);
export const channelLeft = assoc('is_member', false);
