import { hasExpression, replaceExpression } from '@webank/letgo-common';
import type { IPublicTypePropsMap } from '@webank/letgo-types';
import { isJSExpression, isJSFunction } from '@webank/letgo-types';
import { camelCase } from 'lodash-es';
import { parseExpression, parseNormalValue } from './expression';
import { genEventName } from './events';

export function normalProps(key: string, value: any) {
    if (typeof value === 'number')
        return `:${key}="${value}"`;

    if (typeof value === 'boolean') {
        if (value)
            return key;

        return `:${key}="false"`;
    }
    if (value == null)
        return '';

    if (typeof value === 'string')
        return `${key}="${value}"`;

    if (value)
        return `:${key}="${JSON.stringify(value).replace(/\"/g, '\'')}"`;

    return '';
}

export function compileProps(props?: IPublicTypePropsMap, refName = '') {
    if (!props)
        return [];

    return Object.keys(props)
        .filter((key) => {
            // children 走 components 编辑
            return key !== 'children';
        })
        .map((key) => {
            const propValue = props[key];
            if (key.startsWith('v-model')) {
                if (isJSExpression(propValue)) {
                    const val = replaceExpression(propValue.value, (_, expression) => {
                        return expression;
                    });
                    return `${key}="${val}"`;
                }
                else {
                    return `${key}="${propValue}"`;
                }
            }
            if (isJSExpression(propValue)) {
                if (hasExpression(propValue.value))
                    return `:${key}="${parseExpression(propValue.value)}"`;
                return normalProps(key, parseNormalValue(propValue.value));
            }

            if (key.match(/^on[A-Z]/)) {
                const eventName = camelCase(key.replace(/^on/, ''));
                return `@${eventName}="${genEventName(key, refName)}"`;
            }

            if (isJSFunction(propValue))
                return `:${key}="${genEventName(key, refName)}"`;

            return normalProps(key, propValue);
        }).filter(Boolean);
}
