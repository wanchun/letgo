import { markShallowReactive } from '@webank/letgo-common';
import type { IRestQueryResource } from '@webank/letgo-types';
import { genRestApiQueryFunc } from '@webank/letgo-renderer';
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
