import type {
    ICodeStruct,
    IEventHandler,
    IPublicTypeProjectSchema,
    ITemporaryState,
} from '@webank/letgo-types';
import { genCodeMap, isSyntaxError, isExpression as rawIsExpression, sortState } from '@webank/letgo-common';
import {
    IEnumCodeType,
    isRestQueryResource,
} from '@webank/letgo-types';
import { relative } from '../options';
import type { Context, ImportSource, SetupCode } from './types';
import { ImportType } from './types';
import { compilerEventHandlers } from './events';
import { parseFunctionCode } from './parse-function';

export function ensureArray(data?: string | string[]) {
    if (data == null)
        return [];
    if (typeof data === 'string')
        return [data];

    return data;
}

export function isExpression(ctx: Context, code: string) {
    return rawIsExpression(code, (name: string) => {
        return ctx.codes.has(name) || ctx.refs?.has(name) || ctx.globalScope[name] !== undefined || ctx.scope?.includes(name);
    });
}

export function findRootSchema(schema: IPublicTypeProjectSchema, fileName: string) {
    return schema.componentsTree.find(item => item.fileName === fileName);
}

export function genSingleImport(imports: ImportSource[]) {
    if (!imports.length)
        return '';
    const source = imports[0].source;
    const mainPath = imports.reduce((acc, cur) => {
        if (cur.main)
            return cur.main;

        return acc;
    }, '');
    const importNames = new Set<string>();
    let defaultImport: string;
    for (const imp of imports) {
        if ([ImportType.ImportDefaultSpecifier, ImportType.ImportAll].includes(imp.type))
            defaultImport = imp.alias || imp.imported;

        else if (imp.alias && imp.alias !== imp.imported)
            importNames.add(`${imp.imported} as ${imp.alias}`);

        else
            importNames.add(imp.imported);
    }

    const importPath = `'${source}${mainPath}'`;

    if (imports.find(item => item.type === ImportType.ImportNull))
        return `import ${importPath};`;

    if (imports.find(item => item.type === ImportType.ImportAll))
        return `import * as ${defaultImport} from ${importPath};`;

    if (defaultImport && !importNames.size)
        return `import ${defaultImport} from ${importPath};`;

    if (!defaultImport && importNames.size) {
        return `import {${Array.from(importNames).join(
            ', ',
        )}} from ${importPath};`;
    }
    return `import ${defaultImport}, {${Array.from(importNames).join(
        ', ',
    )}} from ${importPath};`;
}

export function genImportCode(imports: ImportSource[]) {
    const sourceSet = new Set<string>();
    const categorizeImports = new Map<string, ImportSource[]>();

    for (const imp of imports) {
        sourceSet.add(imp.source);
        if (categorizeImports.has(imp.source))
            categorizeImports.get(imp.source).push(imp);

        else
            categorizeImports.set(imp.source, [imp]);
    }

    const sortedSource = Array.from(sourceSet)
        .map((item) => {
            if (/^[a-zA-Z]/.test(item)) {
                return {
                    source: item,
                    priority: 1,
                };
            }
            if (/^@[a-zA-Z]+/.test(item)) {
                return {
                    source: item,
                    priority: 2,
                };
            }
            if (/^@\//.test(item)) {
                return {
                    source: item,
                    priority: 3,
                };
            }
            return {
                source: item,
                priority: 4,
            };
        })
        .sort(
            (
                a: { source: string; priority: number },
                b: { source: string; priority: number },
            ) => {
                return a.priority - b.priority;
            },
        )
        .map((item) => {
            return item.source;
        });
    const result: string[] = [];
    for (const source of sortedSource)
        result.push(genSingleImport(categorizeImports.get(source)));

    return result.join('\n');
}

export function mergeCodeStruct(lCodeStruct: ICodeStruct, rCodeStruct: ICodeStruct): ICodeStruct {
    return {
        code: [].concat(lCodeStruct.code).concat(rCodeStruct.code),
        directories: [].concat(lCodeStruct.directories).concat(rCodeStruct.directories),
    };
}

function eventSchemaToFunc(ctx: Context, events: IEventHandler[] = []) {
    if (!events.length)
        return [];
    const jsFunctionMap = compilerEventHandlers(ctx, events);
    return Object.keys(jsFunctionMap).reduce((acc, cur) => {
        acc = acc.concat(jsFunctionMap[cur]);
        return acc;
    }, [] as string[]);
}

function getApiPath(api: string = '') {
    api = api.trim();
    if (/^[\/]?\w+\//.test(api))
        return JSON.stringify(api);

    return isSyntaxError(api) ? JSON.stringify(api) : api;
}

function formatVariableInitValue(variable: ITemporaryState) {
    const initValue = variable.initValue.trim();

    if (initValue === '')
        return JSON.stringify(initValue);

    return initValue;
}

export function genCode(ctx: Context, filePath: string, codeStruct: ICodeStruct, isGlobal = false): SetupCode & { codeKeys: string[] } {
    if (!codeStruct)
        return null;

    const options = ctx.config;
    if (!options)
        return;

    const { letgoDir } = options;
    const codeMap = genCodeMap(codeStruct);
    const sortResult = sortState(codeMap);
    const codeStr: string[] = [];
    const codeKeys: string[] = [];
    const importSourceMap = new Map<string, ImportSource>();
    const hooksMap: Record<string, string[]> = {};
    sortResult.forEach((codeId) => {
        const item = codeMap.get(codeId);
        if (item.type === IEnumCodeType.TEMPORARY_STATE) {
            importSourceMap.set('useTemporaryState', {
                imported: 'useTemporaryState',
                type: ImportType.ImportSpecifier,
                source: relative(filePath, `${letgoDir}/useTemporaryState`),
            });
            codeStr.push(`
    const ${item.id} = useTemporaryState({
        id: '${item.id}',
        initValue: ${formatVariableInitValue(item)},
    });
            `);
            codeKeys.push(item.id);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED) {
            importSourceMap.set('useComputed', {
                imported: 'useComputed',
                type: ImportType.ImportSpecifier,
                source: relative(filePath, `${letgoDir}/useComputed`),
            });
            codeStr.push(`
    const ${item.id} = useComputed({
        id: '${item.id}',
        func: () => {
            ${item.funcBody}
        },
    });
            `);
            codeKeys.push(item.id);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_FUNCTION) {
            const funcCode = parseFunctionCode(item.funcBody, item.id);
            if (funcCode) {
                codeStr.push(funcCode);
                codeKeys.push(item.id);
            }
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_QUERY) {
            importSourceMap.set('useJSQuery', {
                imported: 'useJSQuery',
                type: ImportType.ImportSpecifier,
                source: relative(filePath, `${letgoDir}/useJSQuery`),
            });
            if (isRestQueryResource(item)) {
                importSourceMap.set('letgoRequest', {
                    type: ImportType.ImportSpecifier,
                    source: relative(filePath, `${letgoDir}/letgoRequest`),
                    imported: 'letgoRequest',
                });
                if (item.params) {
                    importSourceMap.set('computed', {
                        type: ImportType.ImportSpecifier,
                        source: 'vue',
                        imported: 'computed',
                    });
                }
                const api = getApiPath(item.api);
                codeStr.push(`
    const ${item.id} = useJSQuery({
        id: '${item.id}',
        query(params) {
            return letgoRequest(${api}, params, {
                method: '${item.method || 'POST'}',
                ${item.headers?.value ? `headers: ${item.headers.value},` : ''}  
            })
        },
        ${item.params ? `params: computed(() => (${item.params})),` : ''}
        ${item.enableTransformer ? `enableTransformer: ${item.enableTransformer},` : ''}
        ${(item.enableTransformer && item.transformer) ? `transformer(data) {${item.transformer}},` : ''}
        ${item.queryTimeout ? `queryTimeout: ${item.queryTimeout},` : ''}
        ${item.enableCaching ? `enableCaching: ${item.enableCaching},` : ''}
        ${item.cacheDuration ? `cacheDuration: ${item.cacheDuration},` : ''}
        ${item.cacheType ? `cacheType: '${item.cacheType}',` : ''}
        ${item.runCondition ? `runCondition: '${item.runCondition}',` : ''}
        ${item.runWhenPageLoads ? `runWhenPageLoads: ${item.runWhenPageLoads},` : ''}
        ${isGlobal ? '_isGlobalQuery: true,' : ''}
        ${item.successEvent ? `successEvent: [${eventSchemaToFunc(ctx, item.successEvent).join(',')}],` : ''}
        ${item.failureEvent ? `failureEvent: [${eventSchemaToFunc(ctx, item.failureEvent).join(',')}],` : ''}
    });
                `);
            }
            else {
                codeStr.push(`
    const ${item.id} = useJSQuery({
        id: '${item.id}',
        async query() {
            ${item.query}
        },
        ${item.queryTimeout ? `queryTimeout: ${item.queryTimeout},` : ''}
        ${item.runCondition ? `runCondition: '${item.runCondition}',` : ''}
        ${item.runWhenPageLoads ? `runWhenPageLoads: ${item.runWhenPageLoads},` : ''}
        ${isGlobal ? '_isGlobalQuery: true,' : ''}
        ${item.successEvent ? `successEvent: [${eventSchemaToFunc(ctx, item.successEvent).join(',')}],` : ''}
        ${item.failureEvent ? `failureEvent: [${eventSchemaToFunc(ctx, item.failureEvent).join(',')}],` : ''}
    });
                `);
            }
            codeKeys.push(item.id);
        }
        else if (item.type === IEnumCodeType.LIFECYCLE_HOOK) {
            if (isGlobal) {
                let hookBody = hooksMap[item.hookName];
                if (!hookBody)
                    hookBody = [];
                hookBody.push(item.funcBody);
                hooksMap[item.hookName] = hookBody;
            }
        }
    });

    if (isGlobal) {
        for (const p in hooksMap) {
            const hook = hooksMap[p];
            codeStr.push(`
            const ${p} = async ()=> {
                ${hook.join('\n')}
            };
            `);
            codeKeys.push(p);
        }
    }

    return {
        importSources: Array.from(importSourceMap.values()),
        code: codeStr.join('\n'),
        codeKeys,
    };
}
