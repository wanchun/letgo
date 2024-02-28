import { merge, set } from 'lodash-es';
import type { Context, FileTree, GenOptions } from '../common/types';
import { schemaToCode } from '../common';
import { injectLetgoCode } from '../common/inject-code';
import { genGlobalStateCode } from '../common/global-state';
import { setOptions } from '../options';
import { genCodeMap } from '../common/helper';
import { genPackageJSON } from '../common/pkg';

import { fileStructToString } from './file-struct';
import { compNameToFileName } from './file-name';
import { COMMON_CODES } from './common-codes';

function genComponent(ctx: Context, fileTree: FileTree, options: GenOptions) {
    const { transformJsx, outDir, schema } = options;
    const filesStruct = transformJsx ? transformJsx(schemaToCode(ctx, schema)) : schemaToCode(ctx, schema);

    const components = filesStruct.reduce((acc, cur) => {
        const fileName = compNameToFileName(cur.filename);
        acc[`${fileName}/${fileName}.jsx`] = fileStructToString(cur);
        acc[`${fileName}/index.js`] = `export * from './${fileName}';`;
        return acc;
    }, {} as Record<string, any>);

    set(fileTree, outDir.split('/'), components);
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

    // 处理 package.json
    genPackageJSON(fileTree, options);

    // 处理内置代码
    injectLetgoCode(fileTree, options);

    // 处理全局代码
    genGlobalStateCode(ctx, fileTree, options);

    // 处理组件
    genComponent(ctx, fileTree, options);

    return merge(COMMON_CODES, fileTree);
}
