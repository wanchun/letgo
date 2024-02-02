import type { IPublicTypeJSFunction } from '@webank/letgo-types';
import { executeExpression } from '@webank/letgo-common';

export function funcSchemaToFunc(schema: IPublicTypeJSFunction, ctx: Record<string, unknown>) {
    if (!schema.value.trim())
        return undefined;
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', 'params', `
        let result;
        with(_ctx) {
            result = (${schema.value})(...params);
        }
        return result;
`);
        return (...args: any[]) => {
            const params = (schema.params || []).map(param => executeExpression(param, {
                ...ctx,
                args,
            }, true));
            return fn(ctx, [...params, ...args]);
        };
    }
    catch (err) {
        console.warn('syntax error: ', schema.value);
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
        result = (${schema.value})(...params);
    }
    return result;
`);
        return fn(ctx, params);
    }
    catch (err) {
        console.warn('syntax error: ', schema.value);
        return undefined;
    }
}
