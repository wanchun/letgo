import { merge } from 'lodash-es';
import { version } from '@webank/letgo-components';
import type { IPublicTypeProCodeComponent } from '@webank/letgo-types';
import { isProCodeComponentType } from '@webank/letgo-types';
import type { FileTree, GenOptions } from './types';
import { getUseComponents } from '.';

function getUsedComponentMap(options: GenOptions) {
    const useComponentMap = new Map<string, IPublicTypeProCodeComponent>();
    options.schema.componentsTree.forEach((rootSchema) => {
        getUseComponents(options.schema.componentsMap, rootSchema).forEach((item) => {
            if (isProCodeComponentType(item))
                useComponentMap.set(item.package, item);
        });
    });

    return useComponentMap;
}

function pickUsedPkg(options: GenOptions) {
    const packages = options.schema.packages ?? [];
    const usedComponentMap = getUsedComponentMap(options);
    return packages.filter((pkg) => {
        return usedComponentMap.has(pkg.package) || options.schema.utils?.some((item) => {
            if (item.type !== 'function')
                return item.content?.package === pkg.package;

            return false;
        });
    });
}

export function genPackageJSON(fileTree: FileTree, options: GenOptions) {
    const { basePackageJSON, extraPackageJSON } = options;
    const packageJSON: Record<string, any> = {
        dependencies: {
            'core-js': '3.36.0',
            'vue': '3.3.9',
            '@vueuse/core': '10.9.0',
            'lodash-es': '4.17.21',
            '@qlin/request': '0.2.5',
            '@webank/letgo-components': version,
        },
    };
    pickUsedPkg(options).forEach((item) => {
        if (!item)
            return;

        packageJSON.dependencies[item.package] = item.version;
    });

    const res = merge(basePackageJSON ?? {}, packageJSON, extraPackageJSON ?? {});

    fileTree['package.json'] = JSON.stringify(res, null, 4);
}
