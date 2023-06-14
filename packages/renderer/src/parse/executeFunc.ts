import type { IPublicTypeJSFunction } from '@webank/letgo-types';
import { executeExpression } from './parse';

export function funcSchemaToFunc(schema: IPublicTypeJSFunction, ctx: Record<string, unknown>) {
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('letgoCtx', 'params', `
        let result;
        with(letgoCtx) {
            result = (${schema.value})(...params);
        }
        return result;
`);
        return (...args: any[]) => {
            const params = (schema.params || []).map(param => executeExpression(param, ctx));
            return fn(ctx, [...params, ...args]);
        };
    }
    catch (err) {
        console.warn('executeFunc.error', err, schema.value, ctx);
        return undefined;
    }
}

export function executeFunc(schema: IPublicTypeJSFunction, ctx: Record<string, unknown>) {
    try {
        const params = schema.params.map(param => executeExpression(param, ctx));
        // eslint-disable-next-line no-new-func
        const fn = new Function('letgoCtx', 'params', `
        let result;
    with(letgoCtx) {
        result = (${schema.value})(...params);
    }
    return result;
`);
        return fn(ctx, params);
    }
    catch (err) {
        console.warn('executeFunc.error', err, schema.value, ctx);
        return undefined;
    }
}
