import path from 'node:path';
import type {
    ICodeItem,
    ICodeStruct,
    IEventHandler,
    IPublicTypeCompositeValue,
    IPublicTypeJSSlot,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import { isSyntaxError, replaceFunctionName, sortState } from '@webank/letgo-common';
import {
    IEnumCodeType,
    isJSExpression,
    isJSFunction,
    isJSSlot,
    isNodeSchema,
    isRestQueryResource,
} from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';
import { getOptions, relative } from '../options';
import type { ImportSource, SetupCode } from './types';
import { ImportType } from './types';
import { compilerEventHandlers } from './events';

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
                a: { source: string, priority: number },
                b: { source: string, priority: number },
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

export function traverseNodePropsSlot(value: IPublicTypeCompositeValue, callback: (key: string, jsSlot: IPublicTypeJSSlot) => void) {
    if (Array.isArray(value)) {
        value.map(item => traverseNodePropsSlot(item, callback));
    }
    else if (!isJSSlot(value) && !isJSExpression(value) && !isJSFunction(value) && isPlainObject(value)) {
        return Object.keys(value).forEach((key) => {
            if (key !== 'children') {
                const data = value[key as keyof typeof value];
                if (isJSSlot(data))
                    callback(key, data);
                else if (typeof data === 'object')
                    traverseNodePropsSlot(data, callback);
            }
        });
    }
}

export function traverseNodeSchema(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    callback: (schema: IPublicTypeNodeSchema) => void,
) {
    if (Array.isArray(nodeData)) {
        nodeData.forEach((item) => {
            if (isNodeSchema(item)) {
                callback(item);
                traverseNodePropsSlot(item.props, (key: string, jsSlot: IPublicTypeJSSlot) => {
                    traverseNodeSchema(jsSlot.value, callback);
                });
                if (item.props.children) {
                    if (Array.isArray(item.props.children))
                        traverseNodeSchema(item.props.children, callback);

                    else
                        traverseNodeSchema([item.props.children], callback);
                }
                if (item.children)
                    traverseNodeSchema(item.children, callback);
            }
            else if (isJSSlot(item)) {
                traverseNodeSchema(
                    Array.isArray(item.value) ? item.value : [item.value],
                    callback,
                );
            }
        });
    }
    else if (isNodeSchema(nodeData)) {
        callback(nodeData);
        traverseNodePropsSlot(nodeData.props, (key: string, jsSlot: IPublicTypeJSSlot) => {
            traverseNodeSchema(jsSlot.value, callback);
        });
        if (nodeData.children)
            traverseNodeSchema(nodeData.children, callback);
    }
}

export function genCodeMap(code: ICodeStruct) {
    const codeMap = new Map<string, ICodeItem>();
    code.code.forEach((item) => {
        codeMap.set(item.id, item);
    });

    code.directories.forEach((directory) => {
        directory.code.forEach((item) => {
            codeMap.set(item.id, item);
        });
    });
    return codeMap;
}

function eventSchemaToFunc(events: IEventHandler[] = []) {
    if (!events.length)
        return [];
    const jsFunctionMap = compilerEventHandlers(events);
    return Object.keys(jsFunctionMap).reduce((acc, cur) => {
        acc = acc.concat(jsFunctionMap[cur]);
        return acc;
    }, [] as string[]);
}

export function genCode(filePath: string, codeStruct: ICodeStruct): SetupCode {
    if (!codeStruct)
        return null;

    const options = getOptions();
    if (!options)
        return;

    const { outDir } = options;
    const codeMap = genCodeMap(codeStruct);
    const sortResult = sortState(codeMap);
    const codeStr: string[] = [];
    const importSourceMap = new Map<string, ImportSource>();
    sortResult.forEach((codeId) => {
        const item = codeMap.get(codeId);
        if (item.type === IEnumCodeType.TEMPORARY_STATE) {
            importSourceMap.set('useTemporaryState', {
                imported: 'useTemporaryState',
                type: ImportType.ImportSpecifier,
                source: relative(filePath, `${outDir}/useTemporaryState`),
            });
            codeStr.push(`
    const ${item.id} = useTemporaryState({
        id: '${item.id}',
        initValue: ${item.initValue.trim()},
    });
            `);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED) {
            importSourceMap.set('useComputed', {
                imported: 'useComputed',
                type: ImportType.ImportSpecifier,
                source: relative(filePath, `${outDir}/useComputed`),
            });
            codeStr.push(`
    const ${item.id} = useComputed({
        id: '${item.id}',
        func: () => {
            ${item.funcBody}
        },
    });
            `);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_FUNCTION) {
            codeStr.push(replaceFunctionName(item.funcBody, item.id));
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_QUERY) {
            importSourceMap.set('useJSQuery', {
                imported: 'useJSQuery',
                type: ImportType.ImportSpecifier,
                source: relative(filePath, `${outDir}/useJSQuery`),
            });
            if (isRestQueryResource(item)) {
                importSourceMap.set('letgoRequest', {
                    type: ImportType.ImportSpecifier,
                    source: relative(filePath, `${outDir}/letgoRequest`),
                    imported: 'letgoRequest',
                });
                const api = isSyntaxError(item.api) ? JSON.stringify(item.api) : item.api;
                const params = item.params ? `, ${item.params}` : ', null';
                codeStr.push(`
    const ${item.id} = useJSQuery({
        id: '${item.id}',
        query() {
            return letgoRequest(${api}${params}, {
                method: '${item.method || 'POST'}'  
            })
        },
        ${item.enableTransformer ? `enableTransformer: ${item.enableTransformer},` : ''}
        ${(item.enableTransformer && item.transformer) ? `transformer(data) {${item.transformer}},` : ''}
        ${item.showSuccessToaster ? `showSuccessToaster: ${item.showSuccessToaster},` : ''}
        ${item.showSuccessToaster ? `showSuccessToaster: ${item.showSuccessToaster},` : ''}
        ${item.successMessage ? `successMessage: '${item.successMessage}',` : ''}
        ${item.queryTimeout ? `queryTimeout: ${item.queryTimeout},` : ''}
        ${item.runCondition ? `runCondition: '${item.runCondition}',` : ''}
        ${item.runWhenPageLoads ? `runWhenPageLoads: ${item.runWhenPageLoads},` : ''}
        ${(item.queryFailureCondition && item.queryFailureCondition.length) ? `queryFailureCondition: ${item.queryFailureCondition},` : ''}
        ${item.successEvent ? `successEvent: [${eventSchemaToFunc(item.successEvent).join(',')}],` : ''}
        ${item.failureEvent ? `failureEvent: [${eventSchemaToFunc(item.failureEvent).join(',')}],` : ''}
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
        ${item.showFailureToaster ? `showFailureToaster: ${item.showFailureToaster},` : ''}
        ${item.showSuccessToaster ? `showSuccessToaster: ${item.showSuccessToaster},` : ''}
        ${item.successMessage ? `successMessage: '${item.successMessage}',` : ''}
        ${item.queryTimeout ? `queryTimeout: ${item.queryTimeout},` : ''}
        ${item.runCondition ? `runCondition: '${item.runCondition}',` : ''}
        ${item.runWhenPageLoads ? `runWhenPageLoads: ${item.runWhenPageLoads},` : ''}
        ${(item.queryFailureCondition && item.queryFailureCondition.length) ? `queryFailureCondition: ${item.queryFailureCondition},` : ''}
        ${item.successEvent ? `successEvent: [${eventSchemaToFunc(item.successEvent).join(',')}],` : ''}
        ${item.failureEvent ? `failureEvent: [${eventSchemaToFunc(item.failureEvent).join(',')}],` : ''}
    });
                `);
            }
        }
    });

    return {
        importSources: Array.from(importSourceMap.values()),
        code: codeStr.join('\n'),
    };
}
