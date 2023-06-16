import type {
    CodeItem,
    CodeStruct,
    IPublicTypeComponentMap, IPublicTypeEventHandler, IPublicTypeJSFunction, IPublicTypeNodeData, IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    CodeType,
    isJSFunction,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { calcDependencies, checkCycleDependency, eventHandlersToJsFunction } from '@webank/letgo-common';
import { getCurrentContext } from './compiler-context';
import { genGlobalConfig } from './global-config';
import { genImportCode, traverseNodeSchema } from './helper';
import { ImportType } from './types';
import type { ImportSource, SetupCode } from './types';
import { funcSchemaToFunc, genEventName } from './events';
import { parseFuncBody, parseInput } from './expression';

function genComponentImports(componentMaps: IPublicTypeComponentMap[]) {
    const importSources: ImportSource[] = [];
    componentMaps.forEach((componentMap) => {
        if (isProCodeComponentType(componentMap)) {
            importSources.push({
                source: componentMap.package,
                type: ImportType.ImportSpecifier,
                imported: componentMap.exportName,
            });
        }
    });

    return importSources;
}

function genCodeMap(code: CodeStruct) {
    const codeMap = new Map<string, CodeItem>();
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

function eventSchemaToFunc(events: IPublicTypeEventHandler[] = []) {
    if (!events.length)
        return [];
    const jsFunctionMap = eventHandlersToJsFunction(events);
    const jsFunctions = Object.keys(jsFunctionMap).reduce((acc, cur) => {
        acc = acc.concat(jsFunctionMap[cur]);
        return acc;
    }, []);
    return jsFunctions.map(item => funcSchemaToFunc(item));
}

function genCode(schema: IPublicTypeRootSchema): SetupCode {
    const codeMap = genCodeMap(schema.code);
    const dependencyMap = new Map<string, string[]>();

    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, codeMap));

    const sortResult = checkCycleDependency(dependencyMap);
    const codeStr: string[] = [];
    const importSourceMap = new Map<string, ImportSource>();
    sortResult.reverse().forEach((codeId) => {
        const item = codeMap.get(codeId);
        if (item.type === CodeType.TEMPORARY_STATE) {
            importSourceMap.set('useTemporaryState', {
                imported: 'useTemporaryState',
                type: ImportType.ImportSpecifier,
                source: '@/use/useTemporaryState',
            });
            codeStr.push(`
            const ${item.id} = useTemporaryState({
                id: '${item.id}',
                initValue: ${parseInput(item.initValue)},
            });
            `);
        }
        else if (item.type === CodeType.JAVASCRIPT_COMPUTED) {
            importSourceMap.set('useComputed', {
                imported: 'useComputed',
                type: ImportType.ImportSpecifier,
                source: '@/use/useComputed',
            });
            codeStr.push(`
            const ${item.id} = useComputed({
                id: '${item.id}',
                func: () => {
                    ${parseFuncBody(item.funcBody)}
                },
            });
            `);
        }
        else if (item.type === CodeType.JAVASCRIPT_QUERY) {
            importSourceMap.set('useJSQuery', {
                imported: 'useJSQuery',
                type: ImportType.ImportSpecifier,
                source: '@/use/useJSQuery',
            });
            codeStr.push(`
            const ${item.id} = useJSQuery({
                id: '${item.id}',
                query() {
                    ${item.query}
                },
                ${item.enableTransformer ? `enableTransformer: ${item.enableTransformer},` : ''}
                ${item.transformer ? `transformer: '${item.transformer}',` : ''}
                ${item.showFailureToaster ? `showFailureToaster: ${item.showFailureToaster},` : ''}
                ${item.showSuccessToaster ? `showSuccessToaster: ${item.showSuccessToaster},` : ''}
                ${item.successMessage ? `successMessage: '${item.successMessage}',` : ''}
                ${item.queryTimeout ? `queryTimeout: ${item.queryTimeout},` : ''}
                ${item.runCondition ? `runCondition: ${item.runCondition},` : ''}
                ${(item.queryFailureCondition && item.queryFailureCondition.length) ? `queryFailureCondition: ${item.queryFailureCondition},` : ''}
                ${item.successEvent ? `successEvent: ${eventSchemaToFunc(item.successEvent)}},` : ''}
                ${item.failureEvent ? `failureEvent: ${eventSchemaToFunc(item.failureEvent)},` : ''}
            });
            `);
        }
    });

    return {
        importSources: Array.from(importSourceMap.values()),
        code: codeStr.join('\n'),
    };
}

function genRefCode(componentRefs: Set<string>) {
    if (!componentRefs.size) {
        return {
            importSources: [],
            code: '',
        };
    }
    const code = Array.from(componentRefs).map((item) => {
        return `const [${item}RefEl, ${item}] = useInstance()`;
    }).join('\n');
    return {
        importSources: [{
            imported: 'useInstance',
            type: ImportType.ImportSpecifier,
            source: '@/use/useInstance',
        }],
        code,
    };
}

function getComponentEvents(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentEvents: Map<string, Map<string, IPublicTypeJSFunction[]>> = new Map();
    traverseNodeSchema(nodeData, (item) => {
        const currentEventMap = new Map<string, IPublicTypeJSFunction[]>();
        Object.keys(item.props).forEach((propName) => {
            if (propName.match(/^on[A-Z]/))
                currentEventMap.set(propName, item.props[propName] as any);
            else if (isJSFunction(item.props[propName]))
                currentEventMap.set(propName, [item.props[propName]] as any);
        });
        if (currentEventMap.size)
            componentEvents.set(item.ref, currentEventMap);
    });
    return componentEvents;
}

function genUseComponentEvents(rootSchema: IPublicTypeRootSchema) {
    const componentEvents = getComponentEvents(rootSchema);
    const eventFuncs: string[] = [];
    for (const [refName, currentComponentEvents] of componentEvents) {
        for (const [propName, events] of currentComponentEvents) {
            const funName = genEventName(propName, refName);
            if (events.length === 1) {
                const func = funcSchemaToFunc(events[0]);
                eventFuncs.push(func.replace('function ', `function ${funName}`));
            }
            else {
                eventFuncs.push(`
                function ${funName}(...args) {
                    let result;
                    [${events.map(funcSchemaToFunc).join(',')}].forEach(fn => {
                        result = fn(...args);
                    })
                    return result;
                }
                `);
            }
        }
    }
    return eventFuncs;
}

export function genScript(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
    componentRefs: Set<string>,
) {
    const context = getCurrentContext();
    const codeImports = genComponentImports(componentMaps);
    const configCodeSnippet = genGlobalConfig(context.config);
    const refCode = genRefCode(componentRefs);
    const codes = genCode(rootSchema);
    return `<script setup>
            ${genImportCode(configCodeSnippet.importSources.concat(codeImports, refCode.importSources, codes.importSources))}
            ${configCodeSnippet.code}
            ${refCode.code}
            ${codes.code}

            ${genUseComponentEvents(rootSchema).join('\n')}
        </script>`;
    return '';
}
