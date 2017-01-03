import {where, is, pick} from 'ramda';

export type InstantMessage = {
    id: string;
    user: string;
    is_open: boolean;
    created: number;
}

export const isInstantMessage = where({
    id: is(String),
    user: is(String),
    is_open: is(Boolean),
    created: is(Number)
});

const imKeyList: Array<keyof InstantMessage> = [
    'id',
    'user',
    'is_open',
    'created'
];

export const makeInstantMessage = pick(imKeyList);
