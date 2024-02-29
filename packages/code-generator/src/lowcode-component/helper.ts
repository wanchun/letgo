import { isPlainObject } from 'lodash-es';
import {
    isJSFunction,
} from '@webank/letgo-types';

export function normalizeProp(value: unknown) {
    if (typeof value === 'number')
        return value;

    if (typeof value === 'boolean')
        return value;

    if (typeof value === 'string')
        return `'${value}'`;

    if (isJSFunction(value))
        return value.value;

    if (isPlainObject(value) || Array.isArray(value))
        return JSON.stringify(value);

    return value;
}
