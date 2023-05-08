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
import { genPageTemplate } from './genTemplate';
import { genStyle } from './style';
import { genScript } from './script';

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
    nodeData: IPublicTypeNodeData[],
    componentNames: Set<string> = new Set(),
) {
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

export function schemaToCode(schema: IPublicTypeProjectSchema) {
    const rootComponents = schema.componentsTree.map((rootSchema) => {
        compileRootSchema(
            getUseComponents(schema.componentsMap, rootSchema),
            rootSchema,
        );
    });
    console.log(rootComponents);
}
