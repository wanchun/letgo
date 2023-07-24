import { ResourceType } from '@harrywan/letgo-types';
import type { IJavascriptQuery, IRestQueryResource } from '@harrywan/letgo-types';

import { RestApiQueryImpl } from './rest-api';
import { JavascriptQueryImpl } from './base';

export { JavascriptQueryImpl } from './base';

export function createQueryImpl(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
    if (data.resourceType === ResourceType.RESTQuery)
        return new RestApiQueryImpl(data as IRestQueryResource, deps, ctx);

    return new JavascriptQueryImpl(data, deps, ctx);
}
