import { merge, set } from 'lodash-es';
import { genCodeMap } from '@webank/letgo-common';
import type { IPublicTypeComponentSchema } from '@webank/letgo-types';
import type { Context, FileTree, LowCodeComponentOptions } from '../common/types';
import { schemaToCode } from '../common';
import { injectLetgoCode } from '../common/inject-code';
import { setOptions } from '../options';
import { findRootSchema } from '../common/helper';
import { genPackageJSON } from '../common/pkg';
import { fileStructToLowcodeComponent } from './file-struct';
import { genComponentMeta } from './meta';

function genComponent(ctx: Context, fileTree: FileTree, options: LowCodeComponentOptions) {
    const { outDir, schema } = options;
    const filesStruct = schemaToCode(ctx);

    const fileStruct = filesStruct[0];
    const rootSchema = findRootSchema(schema, fileStruct.rawFileName) as IPublicTypeComponentSchema;
    const fileName = fileStruct.fileName;

    merge(fileTree, set({}, outDir.split('/'), {
        [`${fileName}.jsx`]: fileStructToLowcodeComponent(fileStruct, rootSchema, schema.utils),
        'index.js': `export * from './${fileName}';

        export default {
            version: '${options.extraPackageJSON.version}'
        }
        `,
        'index.meta.js': genComponentMeta(schema, options),
    }));
}

function genPkgName(fileName: string) {
    return `@webank/letgo-component-${fileName || 'test'}`;
}

export function genLowCodeComponent(_options: LowCodeComponentOptions): FileTree {
    const options = setOptions({
        outDir: 'src',
        ..._options,
    }) as LowCodeComponentOptions;

    const fileTree: FileTree = {};

    const ctx: Context = {
        schema: options.schema,
        config: options,
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
