import type { IPublicTypeJSExpression, IPublicTypeJSFunction } from '@webank/letgo-types';
import { isJSExpression, isJSFunction } from '@webank/letgo-types';
import { attachContext, hasExpression, replaceExpression } from '@webank/letgo-common';
import { isFunction, isNil, isPlainObject, isString, isUndefined } from 'lodash-es';
import { executeFunc } from './executeFunc';

export function parseExpression(schema: IPublicTypeJSExpression, ctx: Record<string, unknown>) {
    try {
        return executeExpression(schema.value, ctx);
    }
    catch (err) {
        console.warn('parseExpression.error', err, schema.value, ctx);
        return undefined;
    }
}

export function executeExpression(text: string | null, ctx: Record<string, any>) {
    if (isNil(text))
        return null;
    let result = text;
    try {
        if (hasExpression(text)) {
            result = replaceExpression(text, (_, expression) => {
                const exp = attachContext(expression, name => !isUndefined(ctx[name]));
                // eslint-disable-next-line no-new-func
                const fn = new Function('letgoCtx', `return ${exp}`);
                return fn(ctx);
            });
        }
        result = JSON.parse(result);
        return result;
    }
    catch (_) {
        return result;
    }
}

export function parseSchema(scope?: Record<string, unknown>): string | undefined;
export function parseSchema(
    schema: IPublicTypeJSFunction,
    ctx?: Record<string, unknown>,
): CallableFunction;
export function parseSchema(
    schema: IPublicTypeJSExpression,
    ctx?: Record<string, unknown>,
): unknown;
export function parseSchema<T extends object>(
    schema: T,
    ctx: Record<string, unknown>,
): Record<string, unknown>;
export function parseSchema<T>(schema: T, ctx?: Record<string, unknown>): T;
export function parseSchema(schema: unknown, ctx?: Record<string, unknown>): unknown {
    if (isJSExpression(schema)) {
        return parseExpression(schema, ctx);
    }
    else if (isJSFunction(schema)) {
        return executeFunc(schema, ctx);
    }
    else if (isString(schema)) {
        return schema.trim();
    }
    else if (Array.isArray(schema)) {
        return schema.map(item => parseSchema(item, ctx));
    }
    else if (isFunction(schema)) {
        return schema.bind(ctx);
    }
    else if (isPlainObject(schema)) {
        if (!schema)
            return schema;
        const res: Record<string, unknown> = {};
        Object.keys(schema).forEach((key) => {
            if (key.startsWith('__'))
                return;
            res[key] = parseSchema(schema[key as keyof typeof schema], ctx);
        });
        return res;
    }
    return schema;
}
