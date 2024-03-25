import { set } from 'lodash-es';
import { genCodeMap } from '@webank/letgo-common';
import type { IPublicTypeComponentSchema } from '@webank/letgo-types';
import type { Context, FileTree, LowCodeComponentOptions } from '../common/types';
import { schemaToCode } from '../common';
import { injectLetgoCode } from '../common/inject-code';
import { setOptions } from '../options';
import { findRootSchema } from '../common/helper';
import { genPackageJSON } from '../common/pkg';

import { fileStructToString } from './file-struct';
import { compNameToFileName } from './file-name';
import { genComponentMeta } from './meta';

function genComponent(ctx: Context, fileTree: FileTree, options: LowCodeComponentOptions) {
    const { transformJsx, outDir, schema } = options;
    const filesStruct = transformJsx ? transformJsx(schemaToCode(ctx, schema)) : schemaToCode(ctx, schema);

    const fileStruct = filesStruct[0];
    const rootSchema = findRootSchema(schema, fileStruct.rawFileName) as IPublicTypeComponentSchema;
    const fileName = compNameToFileName(fileStruct.fileName);

    set(fileTree, outDir.split('/'), {
        [`${fileName}.jsx`]: fileStructToString(fileStruct, rootSchema, schema.utils),
        'index.js': `export * from './${fileName}';

        export default {
            version: '${options.extraPackageJSON.version}'
        }
        `,
        'index.meta.js': genComponentMeta(schema, options),
    });
}

function genPkgName(fileName: string) {
    return `@webank/letgo-component-${compNameToFileName(fileName || 'test')}`;
}

export function genLowcodeComponent(_options: LowCodeComponentOptions): FileTree {
    const options = setOptions({
        outDir: 'src',
        ..._options,
    }) as LowCodeComponentOptions;

    const fileTree: FileTree = {};

    const ctx: Context = {
        codes: genCodeMap(options.schema.code),
        scope: [],
    };

    options.extraPackageJSON = {
        name: options.pkgName || genPkgName(options.schema.componentsTree[0]?.fileName),
        version: '1.0.0',
        ...options.extraPackageJSON,
    };
    // 处理 package.json
    genPackageJSON(fileTree, options);

    // 处理内置代码
    injectLetgoCode(fileTree, options);

    // 处理组件
    genComponent(ctx, fileTree, options);

    return fileTree;
}
