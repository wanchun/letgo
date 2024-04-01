import { merge } from 'lodash-es';
import type { FileTree, GenOptions } from './types';

export function genPackageJSON(fileTree: FileTree, options: GenOptions) {
    const { schema, extraPackageJSON } = options;
    const packageJSON: Record<string, any> = {
        dependencies: {
            'core-js': '3.36.0',
            'vue': '3.3.9',
            '@vueuse/core': '10.9.0',
            'lodash-es': '4.17.21',
            '@qlin/request': '0.1.14',
            '@webank/letgo-components': '0.0.4-beta.2',
        },
    };
    schema?.packages.forEach((item) => {
        if (!item)
            return;

        packageJSON.dependencies[item.package] = item.version;
    });

    if (extraPackageJSON)
        merge(packageJSON, extraPackageJSON);

    fileTree['package.json'] = JSON.stringify(packageJSON, null, 4);
}
