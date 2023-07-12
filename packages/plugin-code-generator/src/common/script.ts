import type {
    IPublicTypeComponentMap, IPublicTypeJSFunction, IPublicTypeNodeData, IPublicTypeRootSchema,
} from '@fesjs/letgo-types';
import {
    isJSFunction,
    isProCodeComponentType,
} from '@fesjs/letgo-types';
import { genCode, traverseNodeSchema } from './helper';
import { ImportType } from './types';
import type { ImportSource } from './types';
import { funcSchemaToFunc, genEventName } from './events';
import { applyGlobalState } from './global-state';

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
            if (propName.match(/^on[A-Z]/) && item.props[propName])
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

export function genScript({ componentMaps, rootSchema, componentRefs }: {
    componentMaps: IPublicTypeComponentMap[]
    rootSchema: IPublicTypeRootSchema
    componentRefs: Set<string>
},
): [ImportSource[], string[]] {
    const codeImports = genComponentImports(componentMaps);
    const globalStateSnippet = applyGlobalState();
    const refCodeSnippet = genRefCode(componentRefs);
    const codesSnippet = genCode(rootSchema.code);

    const codes = [
        globalStateSnippet.code,
        refCodeSnippet.code,
        codesSnippet?.code,

        genUseComponentEvents(rootSchema).join('\n'),
    ].filter(Boolean);

    return [
        globalStateSnippet.importSources.concat(codeImports, refCodeSnippet.importSources, codesSnippet?.importSources).filter(Boolean),
        codes,
    ];
}
