import type { IEventHandler, IPublicTypeJSExpression, IPublicTypeJSFunction, IPublicTypeUtils } from '@webank/letgo-types';
import { IEnumEventHandlerAction, IEnumRunScript, isJSExpression, isJSFunction, isRunFunctionEventHandler, isSetLocalStorageEventHandler, isSetTemporaryStateEventHandler } from '@webank/letgo-types';
import { LogIdType, findLibExport } from '@webank/letgo-common';
import { isFunction, isPlainObject, isString } from 'lodash-es';
import config from '../config';
import { executeExpression, executeFunc, funcSchemaToFunc } from './execute';

export function eventHandlerToJsFunction(item: IEventHandler): IPublicTypeJSFunction {
    let expression: string;
    const params: string[] = item.params ? item.params.filter(item => item) : [];
    if (isRunFunctionEventHandler(item)) {
        if (item.type === IEnumRunScript.PLAIN)
            expression = item.funcBody;
        else
            expression = `${item.namespace}(...args)`;
    }
    else if (item.action === IEnumEventHandlerAction.CONTROL_QUERY) {
        expression = `${item.namespace}.${item.method}()`;
    }
    else if (item.action === IEnumEventHandlerAction.CONTROL_COMPONENT) {
        expression = `${item.namespace}.${item.method}(...args)`;
    }
    else if (isSetTemporaryStateEventHandler(item)) {
        // param: 0 value, 1: path，因此需要对数组进行倒序
        params.reverse();
        expression = `${item.namespace}.${item.method}(...args)`;
    }
    else if (isSetLocalStorageEventHandler(item)) {
        // TODO 支持其他方法
        if (item.method === 'setValue')
            expression = `${item.namespace}.${item.method}(...args)`;

        else
            expression = `${item.namespace}.${item.method}()`;
    }

    return {
        type: 'JSFunction',
        // 需要传下入参
        value: isFunction(expression) ? expression : `(...args) => {${expression}}`,
        params,
    };
}

export function eventHandlersToJsFunction(handlers: IEventHandler[] = []) {
    const result: {
        [key: string]: IPublicTypeJSFunction[];
    } = {};
    handlers.forEach((item: IEventHandler) => {
        const jsFuncs: IPublicTypeJSFunction[] = result[item.name] || [];
        if (isRunFunctionEventHandler(item) && (item.namespace || item.funcBody))
            jsFuncs.push(eventHandlerToJsFunction(item));

        else if ((item.namespace && item.method))
            jsFuncs.push(eventHandlerToJsFunction(item));

        result[item.name] = jsFuncs;
    });
    return result;
}

export function parseExpression(schema: IPublicTypeJSExpression, ctx: Record<string, unknown>, infoCtx?: Record<string, any>) {
    try {
        const result = executeExpression(schema.value, ctx);

        // 不能直接访问逻辑实例
        if (result?.ctx)
            return undefined;

        return result;
    }
    catch (err) {
        config.logError(err, infoCtx);
        return undefined;
    }
}

export function parseSchema(scope: Record<string, unknown>, pickPath: (string | number)[]): string | undefined;
export function parseSchema(
    schema: IPublicTypeJSFunction,
    pickPath: (string | number)[],
    ctx?: Record<string, unknown>,
): CallableFunction;
export function parseSchema(
    schema: IPublicTypeJSExpression,
    pickPath: (string | number)[],
    ctx?: Record<string, unknown>,
): unknown;
export function parseSchema<T extends object>(
    schema: T,
    pickPath: (string | number)[],
    ctx: Record<string, unknown>,
): Record<string, unknown>;
export function parseSchema<T>(schema: T, pickPath: (string | number)[], ctx?: Record<string, unknown>): T;
export function parseSchema(schema: unknown, pickPath: (string | number)[], ctx?: Record<string, unknown>): unknown {
    if (isJSExpression(schema)) {
        return parseExpression(schema, ctx, {
            idType: LogIdType.COMPONENT,
            id: pickPath[0],
            paths: pickPath.slice(1),
            content: schema.value,
        });
    }
    else if (isJSFunction(schema)) {
        return executeFunc(schema, ctx, {
            idType: LogIdType.COMPONENT,
            id: pickPath[0],
            paths: pickPath.slice(1),
            content: schema.value,
        });
    }
    else if (isString(schema)) {
        return schema.trim();
    }
    else if (Array.isArray(schema)) {
        return schema.map((item, idx) => parseSchema(item, [...pickPath, idx], ctx));
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
            res[key] = parseSchema(schema[key as keyof typeof schema], [...pickPath, key], ctx);
        });
        return res;
    }
    return schema;
}

export function buildGlobalUtils(libraryMap: Record<string, string>, utils?: IPublicTypeUtils, ctx?: Record<string, any>) {
    if (utils) {
        return utils.reduce((acc, cur) => {
            if (cur.type === 'function') {
                acc[cur.name] = funcSchemaToFunc({
                    schema: cur.content,
                    exeCtx: ctx ?? {},
                    infoCtx: {
                        idType: LogIdType.STATIC,
                        id: '$utils',
                        paths: [cur.name],
                        content: cur,
                    },
                });
            }

            else { acc[cur.name] = findLibExport(libraryMap, cur.name, cur.content); }

            return acc;
        }, {} as {
            [key: string]: (...args: any[]) => any;
        });
    }
    return null;
}
