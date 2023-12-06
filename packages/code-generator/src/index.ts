import { merge } from 'lodash-es';
import type { FileTree, GenOptions } from './common/types';
import { genFileName } from './common/page-meta';
import { toAssemble } from './common/build';
import { schemaToCode } from './common';
import { defaultCodes, defaultPackageJSON } from './defaultContent';
import { genGlobalStateCode } from './common/global-state';
import { setOptions } from './options';

export * from './common/types';
export * from './export-zip';
export { getOptions } from './options';

function genPackageJSON(result: FileTree, options: GenOptions) {
    const { schema, extraPackageJSON } = options;
    const packageJSON: Record<string, any> = defaultPackageJSON;
    schema?.packages.forEach((item) => {
        packageJSON.dependencies[item.package] = item.version;
    });

    if (extraPackageJSON)
        merge(packageJSON, extraPackageJSON);

    result['package.json'] = JSON.stringify(packageJSON, null, 4);
}

function genPageCode(fileTree: FileTree, options: GenOptions) {
    const { pageTransform, pageDir, schema } = options;
    const filesStruct = pageTransform ? pageTransform(schemaToCode(schema)) : schemaToCode(schema);

    const pages = filesStruct.reduce((acc, cur) => {
        acc[genFileName(cur)] = toAssemble(cur);
        return acc;
    }, {} as Record<string, any>);

    fileTree[pageDir] = pages;
}

function genCommonCode(fileTree: FileTree, options: GenOptions) {
    const { outDir } = options;

    Object.keys(defaultCodes).forEach((key) => {
        fileTree[`${outDir}/${key}`] = defaultCodes[key as keyof typeof defaultCodes];
    });
}

function genGlobalCss(fileTree: FileTree, options: GenOptions) {
    const { outDir, schema, globalCssFileName } = options;

    if (schema.css)
        fileTree[`${outDir}/${globalCssFileName}`] = schema.css;
}

export function gen(_options: GenOptions): FileTree {
    const options = setOptions(_options);
    const fileTree: FileTree = {};

    // 处理 package.json
    genPackageJSON(fileTree, options);

    // 处理内置代码
    genCommonCode(fileTree, options);

    // 处理全局代码
    genGlobalStateCode(fileTree, options);

    // 处理全局样式
    genGlobalCss(fileTree, options);

    // 处理页面代码
    genPageCode(fileTree, options);

    return fileTree;
}
