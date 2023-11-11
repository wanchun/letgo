import type {
    IPublicTypeComponentMap,

    IPublicTypeNodeData,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '@harrywan/letgo-types';

import { genScript } from './script';
import { traverseNodeSchema } from './helper';
import { formatFileName, formatPageName, formatPageTitle } from './page-meta';
import { PageFileType } from './types';
import type { FileStruct } from './types';
import { genPageJsx, genSlots } from './jsx/gen-jsx';

function getComponentRefs(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentRefs: Set<string> = new Set();
    traverseNodeSchema(nodeData, (item) => {
        componentRefs.add(item.ref);
    });
    return componentRefs;
}

function getUseComponentRefs(rootSchema: IPublicTypeRootSchema) {
    const componentRefs = getComponentRefs(rootSchema.children);
    const usedComponents = new Set<string>();
    const schemaStr = JSON.stringify(rootSchema);
    for (const refName of componentRefs.values()) {
        // REFACTOR 有可能误杀
        if (schemaStr.includes(`${refName}.`))
            usedComponents.add(refName);
    }
    return usedComponents;
}

function compileRootSchema(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
): FileStruct {
    if (rootSchema.componentName === 'Page') {
        const componentRefs = getUseComponentRefs(rootSchema);
        const fileName = formatFileName(rootSchema.fileName);

        const [importSources, codes] = genScript({
            componentMaps,
            rootSchema,
            componentRefs,
        });

        return {
            fileType: PageFileType.Jsx,
            filename: fileName,
            routeName: formatPageName(fileName),
            pageTitle: formatPageTitle(rootSchema.title),
            afterImports: [],
            importSources,
            codes: codes.concat(genSlots(rootSchema, componentRefs)),
            jsx: genPageJsx(rootSchema, componentRefs),
        };
    }
    return null;
}

function getUseComponentNames(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentNames: Set<string> = new Set();
    traverseNodeSchema(nodeData, (item) => {
        componentNames.add(item.componentName);
    });
    return componentNames;
}

function getUseComponents(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
) {
    const componentNames = getUseComponentNames(rootSchema.children);
    const useComponents: IPublicTypeComponentMap[] = [];
    for (const componentName of componentNames.values()) {
        const component = componentMaps.find(
            item => item.componentName === componentName,
        );
        if (component)
            useComponents.push(component);
    }

    return useComponents;
}

export function schemaToCode(schema: IPublicTypeProjectSchema): FileStruct[] {
    return schema.componentsTree.map((rootSchema) => {
        return compileRootSchema(
            getUseComponents(schema.componentsMap, rootSchema),
            rootSchema,
        );
    }).filter(Boolean);
}
