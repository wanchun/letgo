import type { IPublicTypeJSFunction } from '@webank/letgo-types';
import { executeExpression } from '@webank/letgo-common';
import config from '../config';

export function funcSchemaToFunc({
    schema,
    exeCtx,
    infoCtx,
    scope,
}: {
    schema: IPublicTypeJSFunction;
    exeCtx: Record<string, unknown>;
    infoCtx?: Record<string, unknown>;
    scope?: Record<string, unknown>;
}) {
    if (!schema.value.trim())
        return undefined;
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', 'params', `
        let result;
        with(_ctx) {
            result = (${schema.value}).call(this, ...params);
        }
        return result;
`);
        return (...args: any[]) => {
            const newCtx = scope ? { ...exeCtx, ...scope } : exeCtx;
            try {
                const params = (schema.params || []).map(param => executeExpression(param, {
                    ...newCtx,
                    args,
                }, true));
                return fn.call(exeCtx.__this, newCtx, [...params, ...args]);
            }
            catch (err) {
                config.logError(err, infoCtx);
            }
        };
    }
    catch (err) {
        // syntax error
        config.logError(err, infoCtx);
        return undefined;
    }
}

export function executeFunc(schema: IPublicTypeJSFunction, ctx: Record<string, unknown>) {
    try {
        const params = schema.params.map(param => executeExpression(param, ctx));
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', 'params', `
        let result;
    with(_ctx) {
        result = (${schema.value}).call(this, ...params);
    }
    return result;
`);
        return fn.call(ctx.__this, ctx, params);
    }
    catch (err) {
        console.warn('syntax error: ', schema.value);
        return undefined;
    }
}
