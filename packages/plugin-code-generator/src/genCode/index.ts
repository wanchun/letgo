import type {
    IPublicTypeComponentMap,

    IPublicTypeNodeData,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isJSSlot,
    isNodeSchema,
} from '@webank/letgo-types';
import { isArray } from 'lodash-es';
import { genPageTemplate } from './gen-template';
import { genStyle } from './style';
import { genScript } from './script';
import { setGlobalConfig } from './compiler-context';

function compileRootSchema(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
) {
    if (rootSchema.componentName === 'Page') {
        return {
            template: genPageTemplate(rootSchema),
            script: genScript(componentMaps, rootSchema),
            style: genStyle(rootSchema),
        };
    }
    return {};
}

function getUseComponentNames(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    componentNames: Set<string> = new Set(),
) {
    if (Array.isArray(nodeData)) {
        nodeData.forEach((item) => {
            if (isNodeSchema(item)) {
                componentNames.add(item.componentName);
                if (item.props.children) {
                    if (isArray(item.props.children))
                        getUseComponentNames(item.props.children, componentNames);

                    else
                        getUseComponentNames([item.props.children], componentNames);
                }
                if (item.children)
                    getUseComponentNames(item.children, componentNames);
            }
            else if (isJSSlot(item)) {
                getUseComponentNames(
                    isArray(item.value) ? item.value : [item.value],
                    componentNames,
                );
            }
        });
    }
    else if (isNodeSchema(nodeData)) {
        componentNames.add(nodeData.componentName);
        if (nodeData.children)
            getUseComponentNames(nodeData.children, componentNames);
    }
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

async function saveFile(content: string) {
    const options = {
        types: [
            {
                description: 'vue',
                accept: {
                    'text/plain': ['.vue'],
                },
            },
        ],
    };
    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return handle;
}

export function schemaToCode(schema: IPublicTypeProjectSchema) {
    setGlobalConfig(schema.config);

    const rootComponents = schema.componentsTree.map((rootSchema) => {
        return compileRootSchema(
            getUseComponents(schema.componentsMap, rootSchema),
            rootSchema,
        );
    });

    saveFile(
        `
        ${rootComponents[0].template}

        ${rootComponents[0].script}

        ${rootComponents[0].style}
        `,
    );
    console.log(rootComponents);
}
