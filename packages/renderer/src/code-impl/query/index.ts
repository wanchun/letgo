import { ResourceType } from '@webank/letgo-types';
import type { IJavascriptQuery, IRestQueryResource } from '@webank/letgo-types';

import { RestApiQuery } from './rest-api';
import { JavascriptQueryBase } from './base';

export * from './rest-api';
export { JavascriptQueryBase } from './base';

export function createQueryImpl(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
    let instance;
    if (data.resourceType === ResourceType.RESTQuery)
        instance = new RestApiQuery(data as IRestQueryResource, deps, ctx);
    else
        instance = new JavascriptQueryBase(data, deps, ctx);

    if (instance.runWhenPageLoads)
        instance.trigger();

    return instance;
}
