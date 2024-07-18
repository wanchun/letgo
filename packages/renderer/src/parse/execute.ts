import type { IPublicTypeJSFunction } from '@webank/letgo-types';
import { isNil } from 'lodash-es';
import config from '../config';

export function executeExpression(expression: string | null, ctx: Record<string, any> = {}) {
    if (isNil(expression))
        return undefined;

    if (expression.trim() === '')
        return null;

    // eslint-disable-next-line no-new-func
    const fn = new Function('_ctx', `
            with(_ctx) {
                return (${expression});
            }
        `);

    return fn.call(ctx.__this, ctx);
}

export function evaluateOrReturnInput(expression: string | null, ctx?: Record<string, any>) {
    try {
        return executeExpression(expression, ctx);
    }
    catch (err) {
        return expression;
    }
}

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
                const params = (schema.params || []).map(param => evaluateOrReturnInput(param, {
                    ...newCtx,
                    args,
                }));
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
        const params = schema.params.map(param => evaluateOrReturnInput(param, ctx));
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
