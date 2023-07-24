import { ResourceType } from '@harrywan/letgo-types';
import type { IJavascriptQuery, IRestQueryResource } from '@harrywan/letgo-types';

import { RestApiQuery } from './rest-api';
import { JavascriptQueryBase } from './base';

export * from './rest-api';
export { JavascriptQueryBase } from './base';

export function createQueryImpl(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
    if (data.resourceType === ResourceType.RESTQuery)
        return new RestApiQuery(data as IRestQueryResource, deps, ctx);

    return new JavascriptQueryBase(data, deps, ctx);
}
