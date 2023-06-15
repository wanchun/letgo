import { hasExpression } from '@webank/letgo-common';
import type { IPublicTypeJSFunction } from '@webank/letgo-types';
import { camelCase } from 'lodash-es';
import { parseExpression, parseNormalValue } from './expression';

export function genEventName(prop: string, refName: string) {
    return camelCase(`${prop}_${refName}`);
}

function handleParams(params: string[]) {
    return params.map((param) => {
        if (hasExpression(param))
            return parseExpression(param);
        return parseNormalValue(param);
    });
}

export function funcSchemaToFunc(schema: IPublicTypeJSFunction) {
    if (schema.params) {
        return `function (...args) {
            const params = [${handleParams(schema.params).join(', ')}]; 
            return (${schema.value})(...params, ...args);
        }`;
    }

    return `
    function (...args) {
        return (${schema.value})(...args);
    }
    `;
}
