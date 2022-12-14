import {
    NodeSchema,
    RootSchema,
    NodeData,
    Directive,
    isJSSlot,
    isJSExpression,
    isNodeSchema,
    isDOMText,
    DOMText,
    JSExpression,
    JSSlot,
} from '@webank/letgo-types';
import { isEmpty, isArray, isNil } from 'lodash-es';
import { compileDirectives } from './directives';
import { compileProps } from './props';

function genNodeSchemaChildren(nodeSchema: NodeSchema): NodeData[] {
    if (nodeSchema.props?.children) {
        if (isArray(nodeSchema.props.children)) {
            return nodeSchema.props.children;
        }
        return [nodeSchema.props.children];
    }
    return nodeSchema.children || [];
}

function getDirectives(nodeSchema: NodeSchema): Directive[] {
    const directives: Directive[] = nodeSchema.directives || [];
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
function compileNodeSchema(nodeSchema: NodeSchema) {
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

function compileJSExpression(expression: JSExpression) {
    return `{{ ${expression.value} }}`;
}

function compileDOMText(domText: DOMText) {
    return domText;
}

function compileJsSlot(slot: JSSlot): string {
    const slotContent = slot.value;
    return `<template ${slotContent.name ? `#${slotContent.name}` : ''}${
        slotContent.args ? `="${slotContent.args.join(', ')}"` : ''
    }>
    ${slotContent.components.map(compileNodeSchema).join('\n')}
    </template>`;
}

function compileNodeData(nodeData: NodeData): string {
    if (isNodeSchema(nodeData)) {
        return compileNodeSchema(nodeData);
    } else if (isJSExpression(nodeData)) {
        return compileJSExpression(nodeData);
    } else if (isJSSlot(nodeData)) {
        return compileJsSlot(nodeData);
    } else if (isDOMText(nodeData)) {
        return compileDOMText(nodeData);
    }
    return '';
}

export function genPageTemplate(rootSchema: RootSchema) {
    return `<template>
        <div class="letgo-page" ${compileProps(rootSchema.defaultProps).join(
            ' ',
        )}>
            ${(rootSchema.children || []).map(compileNodeData).join('\n')}
        </div>
    </template>`;
}
