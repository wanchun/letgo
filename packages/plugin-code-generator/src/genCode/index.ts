import type {
    IPublicTypeComponentMap,

    IPublicTypeNodeData,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';

import { traverseExpression } from '@webank/letgo-common';
import { genPageTemplate } from './gen-template';
import { genScript } from './script';
import { setGlobalConfig } from './compiler-context';
import { traverseNodeSchema } from './helper';
import { formatFileName, formatPageName, formatPageTitle } from './page-meta';
import type { PageMeta } from './types';

function getComponentRefs(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentRefs: Set<string> = new Set();
    traverseNodeSchema(nodeData, (item) => {
        componentRefs.add(item.componentName);
    });
    return componentRefs;
}

function getUseComponentRefs(rootSchema: IPublicTypeRootSchema) {
    const componentRefs = getComponentRefs(rootSchema.children);
    const usedComponents = new Set<string>();
    traverseExpression(JSON.stringify(rootSchema), (expression) => {
        for (const refName of componentRefs.values()) {
            // REFACTOR 有可能误杀
            if (expression.includes(refName))
                usedComponents.add(refName);
        }
    });
    return usedComponents;
}

function compileRootSchema(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
) {
    if (rootSchema.componentName === 'Page') {
        const componentRefs = getUseComponentRefs(rootSchema);
        const fileName = formatFileName(rootSchema.fileName);
        const meta: PageMeta = {
            fileName,
            name: formatPageName(fileName),
            title: formatPageTitle(rootSchema.title),
        };
        return {
            meta,
            template: genPageTemplate(rootSchema, componentRefs),
            script: genScript({
                componentMaps,
                rootSchema,
                componentRefs,
                meta,
            }),
        };
    }
    return {};
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

// async function saveFile(rootComponents: {
//     template: string
//     script: string
// }[]) {
//     const content
//         = `
//         ${rootComponents[0].template}

//         ${rootComponents[0].script}
//         `;
//     const options = {
//         types: [
//             {
//                 description: 'vue',
//                 accept: {
//                     'text/plain': ['.vue'],
//                 },
//             },
//         ],
//     };
//     const handle = await window.showSaveFilePicker(options);
//     const writable = await handle.createWritable();
//     await writable.write(content);
//     await writable.close();
//     return handle;
// }

export function schemaToCode(schema: IPublicTypeProjectSchema) {
    setGlobalConfig(schema.config);

    const rootComponents = schema.componentsTree.map((rootSchema) => {
        return compileRootSchema(
            getUseComponents(schema.componentsMap, rootSchema),
            rootSchema,
        );
    });

    return rootComponents;
}
