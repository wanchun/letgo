import { merge } from 'lodash-es';
import { version } from '@webank/letgo-components';
import type { FileTree, GenOptions } from './types';

export function genPackageJSON(fileTree: FileTree, options: GenOptions) {
    const { schema, basePackageJSON, extraPackageJSON } = options;
    const packageJSON: Record<string, any> = {
        dependencies: {
            'core-js': '3.36.0',
            'vue': '3.3.9',
            '@vueuse/core': '10.9.0',
            'lodash-es': '4.17.21',
            '@qlin/request': '0.2.4',
            '@webank/letgo-components': version,
        },
    };
    schema?.packages.forEach((item) => {
        if (!item)
            return;

        packageJSON.dependencies[item.package] = item.version;
    });

    const res = merge(basePackageJSON ?? {}, packageJSON, extraPackageJSON ?? {});

    fileTree['package.json'] = JSON.stringify(res, null, 4);
}
