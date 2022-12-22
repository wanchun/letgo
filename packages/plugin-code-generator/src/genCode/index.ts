import {
    ProjectSchema,
    isNodeSchema,
    NodeData,
    ComponentMap,
    RootSchema,
    isJSSlot,
} from '@webank/letgo-types';
import { isArray } from 'lodash-es';
import { genPageTemplate } from './genTemplate';
import { genStyle } from './style';
import { genScript } from './script';

function compileRootSchema(
    componentMaps: ComponentMap[],
    rootSchema: RootSchema,
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
    nodeData: NodeData[],
    componentNames: Set<string> = new Set(),
) {
    nodeData.forEach((item) => {
        if (isNodeSchema(item)) {
            componentNames.add(item.componentName);
            if (item.props.children) {
                if (isArray(item.props.children)) {
                    getUseComponentNames(item.props.children, componentNames);
                } else {
                    getUseComponentNames([item.props.children], componentNames);
                }
            }
            if (item.children) {
                getUseComponentNames(item.children, componentNames);
            }
        } else if (isJSSlot(item)) {
            getUseComponentNames(item.value, componentNames);
        }
    });
    return componentNames;
}

function getUseComponents(
    componentMaps: ComponentMap[],
    rootSchema: RootSchema,
) {
    const componentNames = getUseComponentNames(rootSchema.children);
    const useComponents: ComponentMap[] = [];
    for (const componentName of componentNames.values()) {
        const component = componentMaps.find(
            (item) => item.componentName === componentName,
        );
        if (component) useComponents.push(component);
    }

    return useComponents;
}

export function schemaToCode(schema: ProjectSchema) {
    const rootComponents = schema.componentsTree.map((rootSchema) => {
        compileRootSchema(
            getUseComponents(schema.componentsMap, rootSchema),
            rootSchema,
        );
    });
    console.log(rootComponents);
}
