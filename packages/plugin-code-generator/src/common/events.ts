import type { IPublicTypeJSFunction } from '@harrywan/letgo-types';
import { camelCase } from 'lodash-es';

export function genEventName(prop: string, refName: string) {
    return camelCase(`${prop}_${refName}`);
}

function handleParams(params: string[]) {
    return params.map((param) => {
        return param.trim();
    });
}

export function funcSchemaToFunc(schema: IPublicTypeJSFunction) {
    if (schema.params && schema.params.length > 0) {
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
