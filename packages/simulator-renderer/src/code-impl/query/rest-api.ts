import { executeExpression, markShallowReactive } from '@webank/letgo-common';
import type { IRestQueryResource } from '@webank/letgo-types';
import { genRestApiQueryFunc } from '@webank/letgo-renderer';
import { isPlainObject } from 'lodash-es';
import { JavascriptQueryImpl } from './base';

export class RestApiQueryImpl extends JavascriptQueryImpl {
    method: string;
    api: string;
    params: string;
    headers?: IRestQueryResource['headers'];
    constructor(data: IRestQueryResource, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        markShallowReactive(this, {
            api: data.api,
            params: data.params,
            method: data.method,
            headers: data.headers,
        });
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
