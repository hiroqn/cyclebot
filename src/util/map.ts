import {
    lensProp,
    over,
    assoc,
    keys,
    dissoc
} from 'ramda';

export interface Map<T> {
    [key: string]: T;
}

export function fromArray<T>(array: T[], getKey: (x: Partial<T>) => string): Map<T> {
    return array.reduce((acc, x) => {
        const key = getKey(x);
        return assoc(key, x, acc);
    }, {});
}

export function create<T>(getKey: (x: T) => string, x: T, m: Map<T>): Map<T> {
    return assoc(getKey(x), x, m);
}

export function update<T>(key: string, project: (x: T) => T, m: Map<T>): Map<T> {
    if (m[key] === undefined) {
        return m;
    }
    return over(lensProp(key), project, m);
}

export function del<T>(key: string, m: Map<T>): Map<T> {
    if (m[key] === undefined) {
        return m;
    }
    return dissoc(key, m);
}

export function findByKey<T>(key: string, m: Map<T>): T | undefined {
    return m[key] === undefined ? undefined : m[key];
}

export function findOne<T>(predict: (x: T) => boolean, m: Map<T>): T | undefined {
    const key = keys(m).find(key => predict(m[key]));
    if (key === undefined) {
        return;
    }
    return m[key];
}
