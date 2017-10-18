import {pick} from 'ramda';

export type InstantMessage = {
    id: string;
    user: string;
    is_open: boolean;
    created: number;
}

export function isInstantMessage(x: any): x is InstantMessage {
    return typeof x === 'object' &&
        x !== null &&
        typeof x.id === 'string' &&
        typeof x.user === 'string' &&
        typeof x.is_open === 'boolean' &&
        typeof x.created === 'number';
};

const imKeyList: Array<keyof InstantMessage> = [
    'id',
    'user',
    'is_open',
    'created'
];

export const makeInstantMessage = pick(imKeyList);
