import {
    type ICodeStruct,
    type IPublicTypeNpmInfo,
    type IPublicTypeRootSchema,
    type IPublicTypeUtils,
    isQueryResource,
} from '@webank/letgo-types';
import { calcDependencies, genCodeMap, isLowcodeProjectSchema } from '@webank/letgo-common';
import { set } from 'lodash-es';
import { relative } from '../options';
import { genCode, genImportCode } from './helper';
import type { CallBackParam, Context, FileTree, GenOptions, ImportSource, SetupCode } from './types';
import { ImportType } from './types';
import { cssResolver } from './resolver';

export const GLOBAL_STATE_FILE_NAME = 'useLetgoGlobal';

const TEMPLATE = `
IMPORTS

function ${GLOBAL_STATE_FILE_NAME}() {

    STATE_CODE

    const __globalCtx = {
        CODE_KEYS
    };

    const __query_deps = QUERY_DEPS;

    return new Proxy(__globalCtx, {
        get(obj, prop) {
            if (RUN_WHEN_PAGE_LOADS_QUERY.includes(prop) && !__globalCtx[prop].hasBeenCalled)
                __globalCtx[prop].trigger();

            const currentQuery = __query_deps[prop];
            if (currentQuery) {
                currentQuery.forEach(d => {
                    if (__globalCtx[d].runWhenPageLoads && !__globalCtx[d].hasBeenCalled) {
                        __globalCtx[d].trigger();
                    }
                });
            }

            return obj[prop];
        },
    });
}

export const useSharedLetgoGlobal = createGlobalState(${GLOBAL_STATE_FILE_NAME});
`;

const globalStateKeys: string[] = [];

function getGlobalContextKey() {
    return globalStateKeys;
}

let hasGlobal: boolean;
function getGlobalFlag() {
    return hasGlobal;
}

function compilerNpmImports(npm: IPublicTypeNpmInfo): ImportSource {
    return {
        source: npm.package,
        imported: npm.exportName,
        type: npm.assembling ? ImportType.ImportAll : (npm.destructuring ? ImportType.ImportSpecifier : ImportType.ImportDefaultSpecifier),
    };
}

function genUtilsImports(utils: IPublicTypeUtils, schema: Context['schema']): ImportSource[] {
    const importSources: ImportSource[] = [];
    utils.filter(item => item.type !== 'function').forEach((item) => {
        const content = item.content as IPublicTypeNpmInfo;
        importSources.push(compilerNpmImports(content));
        cssResolver(content, schema).forEach((importSource) => {
            importSources.push(importSource);
        });
    });
    return importSources;
}

export function compilerUtils(utils: IPublicTypeUtils, schema: Context['schema']) {
    const importSources = genUtilsImports(utils, schema);
    const code = utils.map((item) => {
        if (item.type === 'function')
            return `${item.name}: ${item.content.value}`;
        else
            return `${item.name}`;
    }).join(',');

    return {
        code,
        importSources,
    };
}

function findQueriesDeps(codeStruct: ICodeStruct, queries: string[]) {
    const codeMap = genCodeMap(codeStruct);
    const dependencyMap: Record<string, string[]> = {};
    for (const [codeId, item] of codeMap) {
        const deps = calcDependencies(item).filter((item) => {
            return queries.includes(item);
        });
        if (deps.length)
            dependencyMap[codeId] = deps;
    }

    return dependencyMap;
}

function findRunWhenPageLoadsQueries(codeStruct: ICodeStruct) {
    const queries: string[] = [];
    const codeMap = genCodeMap(codeStruct);
    codeMap.forEach((item) => {
        if (isQueryResource(item) && item.runWhenPageLoads)
            queries.push(item.id);
    });
    return queries;
}

export function genGlobalStateCode(ctx: Context, fileTree: FileTree, options: GenOptions): void {
    const { schema, letgoDir, globalCodeCallback } = options;
    globalStateKeys.length = 0;
    hasGlobal = !!(schema.code || schema.config || schema.utils);
    if (!hasGlobal)
        return null;

    const result: CallBackParam = {
        import: [{
            source: '@vueuse/core',
            imported: 'createGlobalState',
            type: ImportType.ImportSpecifier,
        }, {
            source: 'vue',
            imported: 'reactive',
            type: ImportType.ImportSpecifier,
        }],
        code: '',
        export: [],
    };

    if (schema.config) {
        result.code += `
    const $context = reactive(${JSON.stringify(schema.config || {})});
    const letgoContext = $context;
        `;
        result.export.push('$context');
        result.export.push('letgoContext');
        globalCodeCallback?.afterConfig?.(result);
    }

    if (schema.utils) {
        const _result = compilerUtils(schema.utils, schema);
        result.import.push(..._result.importSources);
        result.code += `
        const $utils = {
            ${_result.code}
        };
        const utils = $utils;
            `;
        result.export.push('$utils');
        result.export.push('utils');
    }

    const runWhenPageLoadsQueries = schema.code ? findRunWhenPageLoadsQueries(schema.code) : [];
    if (schema.code) {
        const _result = genCode(ctx, `${letgoDir}/${GLOBAL_STATE_FILE_NAME}.js`, schema.code, true);
        result.import.push(..._result.importSources);
        result.code += _result.code;
        result.export.push(..._result.codeKeys);
    }

    let tmp = TEMPLATE.replace('IMPORTS', result.import.length ? genImportCode(result.import) : '');
    tmp = tmp.replace('STATE_CODE', result.code);
    tmp = tmp.replace('CODE_KEYS', result.export.length ? result.export.join(',') : '');
    tmp = tmp.replace('RUN_WHEN_PAGE_LOADS_QUERY', JSON.stringify(runWhenPageLoadsQueries));
    tmp = tmp.replace('QUERY_DEPS', JSON.stringify(findQueriesDeps(schema.code, runWhenPageLoadsQueries)));

    globalStateKeys.push(...result.export);

    set(fileTree, `${letgoDir}/${GLOBAL_STATE_FILE_NAME}.js`.split('/'), tmp);
}

function getUsedGlobalVariables(ctx: Context) {
    if (ctx.useVariables) {
        return getGlobalContextKey().filter((key) => {
            return ctx.useVariables.has(key);
        });
    }

    return getGlobalContextKey();
}

export function genGlobalState(ctx: Context, filePath: string, schema: IPublicTypeRootSchema): SetupCode & {
    useGlobalVariables: string[];
} {
    const { letgoDir } = ctx.config;
    const useGlobalVariables = getUsedGlobalVariables(ctx);
    if (!getGlobalFlag() || isLowcodeProjectSchema(schema) || useGlobalVariables.length === 0) {
        return {
            importSources: [],
            code: '',
            useGlobalVariables: [],
        };
    }

    return {
        importSources: [{
            imported: 'useSharedLetgoGlobal',
            type: ImportType.ImportSpecifier,
            source: relative(filePath, `${letgoDir}/${GLOBAL_STATE_FILE_NAME}`),
        }],
        code: `const {${useGlobalVariables.join(', ')}} = useSharedLetgoGlobal()`,
        useGlobalVariables,
    };
}
