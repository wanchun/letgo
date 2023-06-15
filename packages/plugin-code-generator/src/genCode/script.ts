import type {
    CodeItem,
    CodeStruct,
    IPublicTypeComponentMap, IPublicTypeJSFunction, IPublicTypeNodeData, IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isJSFunction,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { calcDependencies, checkCycleDependency } from '@webank/letgo-common';
import { getCurrentContext } from './compiler-context';
import { genGlobalConfig } from './global-config';
import { genImportCode, traverseNodeSchema } from './helper';
import { type ImportSource, ImportType } from './types';
import { funcSchemaToFunc, genEventName } from './events';

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

function genCode(schema: IPublicTypeRootSchema) {
    const codeMap = genCodeMap(schema.code);
    const dependencyMap = new Map<string, string[]>();

    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, codeMap));

    const sortResult = checkCycleDependency(dependencyMap);
    sortResult.reverse().forEach((codeId) => {
        const item = codeMap.get(codeId);
        // TODO 处理 expression
    });
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
    return eventFuncs;
}

export function genScript(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
    componentRefs: Set<string>,
) {
    const context = getCurrentContext();
    const configCodeSnippet = genGlobalConfig(context.config);
    const refCode = genRefCode(componentRefs);
    const codeImports = genComponentImports(componentMaps);
    return `<script setup>
            ${genImportCode(configCodeSnippet.importSources.concat(codeImports, refCode.importSources))}
            ${genComponentImports(componentMaps)}
            ${configCodeSnippet.code}
            ${refCode.code}

            ${genUseComponentEvents(rootSchema).join('\n')}
        </script>`;
    return '';
}
