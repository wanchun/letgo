import type { IPublicTypeJSFunction } from '@webank/letgo-types';

export function executeFunc(schema: IPublicTypeJSFunction, ctx: Record<string, unknown>) {
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', `
    let result;
    with(_ctx) {
        result = (${schema.value})();
    }
    return result;
`);
        return fn(ctx);
    }
    catch (err) {
        console.warn('executeFunc.error', err, schema.value, ctx);
        return undefined;
    }
}
