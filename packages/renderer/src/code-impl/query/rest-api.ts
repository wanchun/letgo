import { executeExpression } from '@harrywan/letgo-common';

import type { IRestQueryResource } from '@harrywan/letgo-types';
import { JavascriptQueryBase } from './base';

export function genRestApiQueryFunc(api: string, method: string, params: string) {
    if (api) {
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', 'params', `
                    let result;
                    with(_ctx) {
                        result = letgoRequest(...params)
                    }
                    return result;
                `);
        return (ctx: Record<string, any>) => {
            const _params = [executeExpression(api, ctx, true), executeExpression(params, ctx), {
                method,
            }];
            return fn(ctx, _params);
        };
    }
}

export class RestApiQuery extends JavascriptQueryBase {
    method: string;
    api: string;
    params: string;
    constructor(data: IRestQueryResource, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        this.method = data.method;
        this.api = data.api;
        this.params = data.params;
    }

    genQueryFn() {
        return genRestApiQueryFunc(this.api, this.method, this.params);
    }
}
