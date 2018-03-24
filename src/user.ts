import {where, is, pick} from 'ramda';

export type User = {
    id: string;
    name: string;
    is_bot: boolean;
    presence: 'active' | 'away';
}

export const isUser = where({
    id: is(String),
    name: is(String),
    is_bot: is(Boolean),
    presence: is(String)
});

const userKeyList = [
    'id',
    'name',
    'is_bot',
    'presence'
];

export const makeUser = pick(userKeyList);
