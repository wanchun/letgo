import type { IPublicTypeNpmInfo, IPublicTypeProjectSchema } from '@webank/letgo-types';
import { ImportType } from './types';
import type { ImportSource } from './types';

export function cssResolver(npm: IPublicTypeNpmInfo, schema: IPublicTypeProjectSchema): ImportSource[] {
    const importSources: ImportSource[] = [];
    const _package = schema.packages?.filter(item => item.package === npm.package)?.[0];
    if (_package?.cssResolver) {
        let res = _package.cssResolver(npm.componentName || npm.exportName);
        res = Array.isArray(res) ? res : [res];
        res.forEach((item) => {
            importSources.push({
                source: item,
                type: ImportType.ImportNull,
            });
        });
    }
    return importSources;
}
