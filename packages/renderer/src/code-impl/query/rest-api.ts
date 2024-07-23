import { type IRestQueryResource, isJSExpression } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';
import { LogIdType } from '@webank/letgo-common';
import { executeExpression } from '../../parse';
import config from '../../config';
import { JavascriptQueryBase } from './base';

function handleHeaders(headers: IRestQueryResource['headers'], ctx: Record<string, any>, id: string) {
    if (isJSExpression(headers)) {
        try {
            return executeExpression(headers.value, ctx) || {};
        }
        catch (err) {
            config.logError(err, {
                id,
                idType: LogIdType.CODE,
                paths: ['headers'],
                content: headers.value,
            });
            return {};
        }
    }

    return {};
}

function getApiPath(api: string, ctx: Record<string, any>, id: string) {
    try {
        if (/^[\/]?\w+\//.test(api))
            return api;

        return executeExpression(api, ctx);
    }
    catch (err) {
        config.logError(err, {
            id,
            idType: LogIdType.CODE,
            paths: ['api'],
            content: api,
        });
        return api;
    }
}

export function geRestParam({
    id,
    ctx,
    params,
    extraParams,
}: {
    id: string;
    ctx: Record<string, any>;
    params?: string;
    extraParams?: Record<string, any>;
}) {
    let _params: unknown;
    try {
        _params = executeExpression(params, ctx);
    }
    catch (err) {
        config.logError(err, {
            id,
            idType: LogIdType.CODE,
            paths: ['params'],
            content: params,
        });
        _params = params;
    }
    if (_params == null)
        return extraParams || null;

    if (isPlainObject(_params) && isPlainObject(extraParams))
        return { ...(_params as object), ...extraParams };

    return _params;
}

export function genRestApiQueryFunc({
    id,
    api,
    params,
    method,
    headers,
}: {
    id: string;
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
                getApiPath(api, ctx, id),
                params,
                {
                    method,
                    headers: headers ? handleHeaders(headers, ctx, id) : undefined,
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
        return geRestParam({
            id: this.id,
            ctx: this.ctx,
            params: this.params,
            extraParams,
        });
    }

    genQueryFn(params?: Record<string, any>) {
        return genRestApiQueryFunc({
            id: this.id,
            api: this.api,
            method: this.method,
            params,
            headers: this.headers,
        });
    }
}
