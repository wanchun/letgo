import { executeExpression } from '@webank/letgo-common';

import { type IRestQueryResource, isJSExpression } from '@webank/letgo-types';
import { JavascriptQueryBase } from './base';

function handleHeaders(headers: IRestQueryResource['headers'], ctx: Record<string, any>) {
    if (isJSExpression(headers))
        return executeExpression(headers.value, ctx) || {};

    return {};
}

export function genRestApiQueryFunc({
    api,
    params,
    method,
    headers,
}: {
    api: string;
    params: string;
    method: string;
    headers?: IRestQueryResource['headers'];
}) {
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
                headers: headers ? handleHeaders(headers, ctx) : undefined,
            }];
            return fn(ctx, _params);
        };
    }
}

export class RestApiQuery extends JavascriptQueryBase {
    method: string;
    api: string;
    params: string;
    headers?: IRestQueryResource['headers'];
    constructor(data: IRestQueryResource, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        this.method = data.method;
        this.api = data.api;
        this.params = data.params;
        this.headers = data.headers;
    }

    genQueryFn() {
        return genRestApiQueryFunc({
            api: this.api,
            method: this.method,
            params: this.params,
            headers: this.headers,
        });
    }
}
