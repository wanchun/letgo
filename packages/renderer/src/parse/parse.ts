import type { IPublicTypeJSExpression, IPublicTypeJSFunction, IPublicTypeUtilsMap } from '@fesjs/letgo-types';
import { isJSExpression, isJSFunction } from '@fesjs/letgo-types';
import { executeExpression, findLibExport } from '@fesjs/letgo-common';
import { isFunction, isPlainObject, isString } from 'lodash-es';
import { executeFunc, funcSchemaToFunc } from './executeFunc';

export function parseExpression(schema: IPublicTypeJSExpression, ctx: Record<string, unknown>) {
    try {
        return executeExpression(schema.value, ctx);
    }
    catch (err) {
        console.warn('parseExpression.error', err, schema.value, ctx);
        return undefined;
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

export function buildGlobalUtils(libraryMap: Record<string, string>, utils?: IPublicTypeUtilsMap) {
    if (utils) {
        return utils.reduce((acc, cur) => {
            if (cur.type === 'function')
                acc[cur.name] = funcSchemaToFunc(cur.content, {});

            else
                acc[cur.name] = findLibExport(libraryMap, cur.name, cur.content);

            return acc;
        }, {} as {
            [key: string]: (...args: any[]) => any
        });
    }
    return null;
}
