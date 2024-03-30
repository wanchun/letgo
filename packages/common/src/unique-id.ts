import { customAlphabet, nanoid } from 'nanoid';

export function uniqueId(prefix = '') {
    return `${prefix ? `${prefix}_` : ''}${nanoid(10)}}`;
}

export function genSeed(count: number = 3) {
    const seed = customAlphabet('abcdefghijklmnopqrstuvwxyz', count);
    return seed();
}
