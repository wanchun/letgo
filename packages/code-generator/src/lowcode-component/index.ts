import { merge, set } from 'lodash-es';
import { genCodeMap } from '@webank/letgo-common';
import type { Context, FileTree, GenOptions } from '../common/types';
import { schemaToCode } from '../common';
import { injectLetgoCode } from '../common/inject-code';
import { setOptions } from '../options';
import { findRootSchema } from '../common/helper';
import { genPackageJSON } from '../common/pkg';

import { fileStructToString } from './file-struct';
import { compNameToFileName } from './file-name';
import { COMMON_CODES } from './common-codes';
import { genComponentsEntry } from './component';
import { genComponentMeta, genComponentMetaEntry } from './meta';

function genComponent(ctx: Context, fileTree: FileTree, options: GenOptions) {
    const { transformJsx, outDir, schema } = options;
    const filesStruct = transformJsx ? transformJsx(schemaToCode(ctx, schema)) : schemaToCode(ctx, schema);

    const components = filesStruct.reduce((acc, cur) => {
        const rootSchema = findRootSchema(schema, cur.rawFileName);
        const fileName = compNameToFileName(cur.fileName);

        acc[`${fileName}/${fileName}.jsx`] = fileStructToString(cur, rootSchema, schema.utils);
        acc[`${fileName}/index.js`] = `export * from './${fileName}';`;
        acc[`${fileName}/index.meta.js`] = genComponentMeta(cur, rootSchema);

        return acc;
    }, {} as Record<string, any>);

    set(fileTree, outDir.split('/'), components);

    genComponentMetaEntry(filesStruct, fileTree);
    genComponentsEntry(filesStruct, fileTree);
}

function genPkgName(fileName: string) {
    return `@webank/letgo-component-${compNameToFileName(fileName || 'test')}`;
}

export function genLowcodeComponent(_options: GenOptions): FileTree {
    const options = setOptions({
        outDir: 'src/components',
        ..._options,
    });
    const fileTree: FileTree = {};

    const ctx: Context = {
        codes: genCodeMap(options.schema.code),
        scope: [],
    };

    options.extraPackageJSON = {
        name: genPkgName(options.schema.componentsTree[0]?.fileName),
        version: '1.0.0',
        ...options.extraPackageJSON,
    };
    // 处理 package.json
    genPackageJSON(fileTree, options);

    // 处理内置代码
    injectLetgoCode(fileTree, options);

    // 处理组件
    genComponent(ctx, fileTree, options);

    return merge(COMMON_CODES, fileTree);
}
