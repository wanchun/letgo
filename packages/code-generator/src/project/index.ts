import { genCodeMap } from '@webank/letgo-common';
import { set } from 'lodash-es';
import { schemaToCode } from '../common';
import { genGlobalStateCode } from '../common/global-state';
import { injectLetgoCode } from '../common/inject-code';
import { genPageEntry } from '../common/page-meta';
import { genPackageJSON } from '../common/pkg';
import type { Context, FileTree, GenOptions } from '../common/types';
import { setOptions } from '../options';
import { toAssemble } from './build';
import { genLowCodeComponent } from './gen-lowcode-component';

function genPageCode(ctx: Context, fileTree: FileTree, options: GenOptions) {
    const { transformJsx, outDir } = options;
    const filesStruct = transformJsx ? transformJsx(schemaToCode(ctx)) : schemaToCode(ctx);

    const pages = filesStruct.reduce((acc, cur) => {
        const filePath = genPageEntry(cur.fileName, !!cur.classCode);
        set(acc, filePath.split('/'), toAssemble(cur));
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

    const $context = options.schema.config || {};
    const $utils = {};

    const ctx: Context = {
        config: options,
        codes: genCodeMap(options.schema.code),
        schema: options.schema,
        scope: [],
        globalScope: {
            letgoContext: $context,
            utils: $utils,
            $context,
            $utils,
        },
    };

    // 处理 package.json
    genPackageJSON(fileTree, options);

    // 处理内置代码
    injectLetgoCode(fileTree, options);

    // 处理低代码组件
    genLowCodeComponent(ctx, fileTree);

    // 处理全局代码
    genGlobalStateCode(ctx, fileTree, options);

    // 处理全局样式
    genGlobalCss(fileTree, options);

    // 处理页面代码
    genPageCode(ctx, fileTree, options);

    return fileTree;
}
