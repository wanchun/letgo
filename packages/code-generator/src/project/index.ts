import { set } from 'lodash-es';
import type { Context, FileTree, GenOptions } from '../common/types';
import { genFileName } from '../common/page-meta';
import { schemaToCode } from '../common';
import { injectLetgoCode } from '../common/inject-code';
import { genGlobalStateCode } from '../common/global-state';
import { setOptions } from '../options';
import { genCodeMap } from '../common/helper';
import { genPackageJSON } from '../common/pkg';
import { toAssemble } from './build';

function genPageCode(ctx: Context, fileTree: FileTree, options: GenOptions) {
    const { transformJsx, outDir, schema } = options;
    const filesStruct = transformJsx ? transformJsx(schemaToCode(ctx, schema)) : schemaToCode(ctx, schema);

    const pages = filesStruct.reduce((acc, cur) => {
        acc[genFileName(cur)] = toAssemble(cur);
        return acc;
    }, {} as Record<string, any>);

    set(fileTree, outDir.split('/'), pages);
}

function genGlobalCss(fileTree: FileTree, options: GenOptions) {
    const { letgoDir, schema, globalCssFileName } = options;

    set(fileTree, `${letgoDir}/${globalCssFileName}`.split('/'), schema.css ?? '');
}

export function genProject(_options: GenOptions): FileTree {
    const options = setOptions(_options);
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

    // 处理全局样式
    genGlobalCss(fileTree, options);

    // 处理页面代码
    genPageCode(ctx, fileTree, options);

    return fileTree;
}
