import { ResourceType } from '@harrywan/letgo-types';
import type { IJavascriptQuery, IRestQueryResource } from '@harrywan/letgo-types';

import { RestApiQueryImpl } from './rest-api';
import { JavascriptQueryImpl } from './base';

export { JavascriptQueryImpl } from './base';

export function createQueryImpl(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
    let instance;
    if (data.resourceType === ResourceType.RESTQuery)
        instance = new RestApiQueryImpl(data as IRestQueryResource, deps, ctx);
    else
        instance = new JavascriptQueryImpl(data, deps, ctx);

    if (instance.runWhenPageLoads)
        instance.trigger();

    return instance;
}