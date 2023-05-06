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
    return nodeSchema.children || [];
}

function getDirectives(nodeSchema: IPublicTypeNodeSchema): IPublicTypeDirective[] {
    const directives: IPublicTypeDirective[] = nodeSchema.directives || [];
    if (isNil(nodeSchema.visible)) {
        directives.unshift({
            name: 'v-show',
            value: nodeSchema.visible,
            modifiers: [],
        });
    }
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
function compileNodeSchema(nodeSchema: IPublicTypeNodeSchema) {
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

function compileJSExpression(expression: IPublicTypeJSExpression) {
    return `{{ ${expression.value} }}`;
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
    return `<template>
        <div class="letgo-page" ${compileProps(rootSchema.defaultProps).join(
            ' ',
        )}>
            ${(rootSchema.children || []).map(compileNodeData).join('\n')}
        </div>
    </template>`;
}
