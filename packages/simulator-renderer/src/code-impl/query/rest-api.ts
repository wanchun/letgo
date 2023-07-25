import { markShallowReactive } from '@harrywan/letgo-common';

import type { IRestQueryResource } from '@harrywan/letgo-types';
import { genRestApiQueryFunc } from '@harrywan/letgo-renderer';
import { JavascriptQueryImpl } from './base';

export class RestApiQueryImpl extends JavascriptQueryImpl {
    method: string;
    api: string;
    params: string;
    constructor(data: IRestQueryResource, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        markShallowReactive(this, {
            api: data.api,
            params: data.params,
            method: data.method,
        });
    }

    genQueryFn() {
        return genRestApiQueryFunc(this.api, this.method, this.params);
    }
}
