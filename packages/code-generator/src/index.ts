import type { IPublicTypePackage, IPublicTypeProjectSchema } from '@harrywan/letgo-types';
import { merge } from 'lodash-es';
import type { FileStruct } from './common/types';
import { genFileName } from './common/page-meta';
import { toAssemble } from './common/build';
import { schemaToCode } from './common';

export * from './common/global-state';
export * from './defaultContent';
export * from './common/types';
export * from './export-zip';

export function genPackageJSON(packages: IPublicTypePackage[], extraPackageJSON?: Record<string, any>) {
    const packageJSON: Record<string, any> = {
        name: '@letgo/gen-code',
        version: '1.0.0',
        license: 'MIT',
        dependencies: {
            'core-js': '3.32.1',
            'vue': '3.3.4',
            '@vueuse/core': '10.4.1',
        },
    };
    packages.forEach((item) => {
        packageJSON.dependencies[item.package] = item.version;
    });

    if (extraPackageJSON)
        merge(packageJSON, extraPackageJSON);

    return packageJSON;
}

export function genPageCode(schema: IPublicTypeProjectSchema, transform?: (filesStruct: FileStruct[]) => FileStruct[]) {
    const filesStruct = transform ? transform(schemaToCode(schema)) : schemaToCode(schema);

    return filesStruct.reduce((acc, cur) => {
        acc[genFileName(cur)] = toAssemble(cur);
        return acc;
    }, {} as Record<string, any>);
}
