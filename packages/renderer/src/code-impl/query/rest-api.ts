import { executeExpression } from '@webank/letgo-common';

import { type IRestQueryResource, isJSExpression } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';
import { JavascriptQueryBase } from './base';

function handleHeaders(headers: IRestQueryResource['headers'], ctx: Record<string, any>) {
    if (isJSExpression(headers))
        return executeExpression(headers.value, ctx) || {};

    return {};
}

function formatRestParams(ctx: Record<string, any>, params: string, extraParams: Record<string, any>) {
    const _params = executeExpression(params, ctx);
    if (!_params)
        return extraParams || null;

    if (isPlainObject(_params))
        return { ..._params, ...extraParams };

    return _params;
}

export function genRestApiQueryFunc({
    api,
    params,
    method,
    headers,
    extraParams,
}: {
    api: string;
    params: string;
    method: string;
    headers?: IRestQueryResource['headers'];
    extraParams?: Record<string, any>;
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
                executeExpression(api, ctx, true),
                formatRestParams(ctx, params, extraParams),
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

    genQueryFn(extraParams?: Record<string, any>) {
        return genRestApiQueryFunc({
            api: this.api,
            method: this.method,
            params: this.params,
            extraParams,
            headers: this.headers,
        });
    }
}
