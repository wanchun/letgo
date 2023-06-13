import type {
    IPublicTypeDOMText,
    IPublicTypeDirective,
    IPublicTypeJSExpression,
    IPublicTypeJSSlot,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isDOMText,
    isJSExpression,
    isJSSlot,
    isNodeSchema,
} from '@webank/letgo-types';
import { isArray, isEmpty, isNil } from 'lodash-es';
import { compileDirectives } from './directives';
import { compileProps } from './props';

function genNodeSchemaChildren(nodeSchema: IPublicTypeNodeSchema): IPublicTypeNodeData[] {
    if (nodeSchema.props?.children) {
        if (isArray(nodeSchema.props.children))
            return nodeSchema.props.children;

        return [nodeSchema.props.children];
    }

    return Array.isArray(nodeSchema.children) ? nodeSchema.children : (nodeSchema.children ? [nodeSchema.children] : []);
}

function getDirectives(nodeSchema: IPublicTypeNodeSchema): IPublicTypeDirective[] {
    const directives: IPublicTypeDirective[] = nodeSchema.directives || [];
    if (isNil(nodeSchema.condition)) {
        directives.unshift({
            name: 'v-if',
            value: nodeSchema.condition,
            modifiers: [],
        });
    }

    return directives;
}

// TODO 支持 loop loopArgs
function compileNodeSchema(nodeSchema: IPublicTypeNodeData) {
    if (isNodeSchema(nodeSchema)) {
        const children = genNodeSchemaChildren(nodeSchema);
        return `<${nodeSchema.componentName} ${compileDirectives(
            getDirectives(nodeSchema),
        ).join(' ')} ${compileProps(nodeSchema.props)} ${
            !isEmpty(children)
                ? `>
                    ${children
                        .map((children) => {
                            return compileNodeData(children);
                        })
                        .join('\n')}
                    </${nodeSchema.componentName}>`
                : ' />'
        }`;
    }
    if (isJSExpression(nodeSchema))
        return nodeSchema.value;

    return nodeSchema;
}

function compileJSExpression(expression: IPublicTypeJSExpression) {
    return expression.value;
}

function compileDOMText(domText: IPublicTypeDOMText) {
    return domText;
}

function compileJsSlot(slot: IPublicTypeJSSlot): string {
    const slotContent = slot.value;
    return `<template ${slot.name ? `#${slot.name}` : ''}${
        slot.params ? `="${slot.params.join(', ')}"` : ''
    }>
    ${(!isArray(slotContent) ? [slotContent] : slotContent)
        .map(compileNodeSchema)
        .join('\n')}
    </template>`;
}

function compileNodeData(nodeData: IPublicTypeNodeData): string {
    if (isNodeSchema(nodeData))
        return compileNodeSchema(nodeData);

    else if (isJSExpression(nodeData))
        return compileJSExpression(nodeData);

    else if (isJSSlot(nodeData))
        return compileJsSlot(nodeData);

    else if (isDOMText(nodeData))
        return compileDOMText(nodeData);

    return '';
}

export function genPageTemplate(rootSchema: IPublicTypeRootSchema) {
    const nodeData = Array.isArray(rootSchema.children) ? rootSchema.children : [rootSchema.children];
    return `<template>
        <div class="letgo-page" ${compileProps(rootSchema.defaultProps).join(
            ' ',
        )}>
            ${nodeData.map(compileNodeData).join('\n')}
        </div>
    </template>`;
}
