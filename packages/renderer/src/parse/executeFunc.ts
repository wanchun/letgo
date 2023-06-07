import type { IPublicTypeJSFunction } from '@webank/letgo-types';
import { executeExpression } from './transform-expression';

export function funcSchemaToFunc(schema: IPublicTypeJSFunction, ctx: Record<string, unknown>) {
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', 'params', `
    with(_ctx) {
        (${schema.value})(...params);
    }
`);
        return () => {
            const params = schema.params.map(param => executeExpression(param, ctx));
            fn(ctx, params);
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
        const fn = new Function('_ctx', 'params', `
    with(_ctx) {
        (${schema.value})(...params);
    }
`);
        return fn(ctx, params);
    }
    catch (err) {
        console.warn('executeFunc.error', err, schema.value, ctx);
        return undefined;
    }
}
