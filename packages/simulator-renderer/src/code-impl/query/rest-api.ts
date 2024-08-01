import type { IRestQueryResource } from '@webank/letgo-types';
import { geRestParam, genRestApiQueryFunc } from '@webank/letgo-renderer';
import { markShallowReactive } from '@webank/letgo-common';
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
