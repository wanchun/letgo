import { executeExpression } from '@webank/letgo-common';

import { type IRestQueryResource, isJSExpression } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';
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
    params: Record<string, any>;
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
            return fn(ctx, [
                /^[\/]?\w+\//.test(api) ? api : executeExpression(api, ctx, true),
                params,
                {
                    method,
                    headers: headers ? handleHeaders(headers, ctx) : undefined,
                },
            ]);
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

    formatParams(extraParams?: Record<string, any>) {
        const _params = executeExpression(this.params, this.ctx);
        if (!_params)
            return extraParams || null;

        if (isPlainObject(_params) && isPlainObject(extraParams))
            return { ..._params, ...extraParams };

        return _params;
    }

    genQueryFn(params?: Record<string, any>) {
        return genRestApiQueryFunc({
            api: this.api,
            method: this.method,
            params,
            headers: this.headers,
        });
    }
}
