import type {
    IPublicTypeDOMText,
    IPublicTypeDirective,
    IPublicTypeJSExpression,
    IPublicTypeJSSlot,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypePropsMap,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isDOMText,
    isJSExpression,
    isJSFunction,
    isJSSlot,
    isNodeSchema,
} from '@webank/letgo-types';
import { camelCase, isArray, isEmpty, isNil, isPlainObject, merge } from 'lodash-es';
import { genEventName } from '../events';
import { compileDirectives } from './directives';

function formatProps(value: any): any {
    if (isJSExpression(value))
        return value.value;

    if (isJSFunction(value)) {
        return value.value;
    }
    else if (Array.isArray(value)) {
        return `
        [
            ${value.map(item => formatProps(item)).join(',')}
        ]
        `;
    }
    else if (isPlainObject(value)) {
        return `
        {
            ${Object.keys(value).map((key) => {
                return `${key}: ${formatProps(value[key])}`;
            }).join(', ')}
        }
        `;
    }
    else if (typeof value === 'string') {
        return JSON.stringify(value);
    }

    return value;
}

function normalProps(key: string, value: any) {
    if (typeof value === 'number')
        return `:${key}="${value}"`;

    if (typeof value === 'boolean') {
        if (value)
            return key;

        return `:${key}="false"`;
    }
    if (value == null)
        return '';

    if (typeof value === 'string')
        return `${key}="${value}"`;

    if (value)
        return `:${key}="${formatProps(value)}"`;

    return '';
}

function compileProps(props?: IPublicTypePropsMap, refName = '') {
    if (!props)
        return [];

    return Object.keys(props)
        .filter((key) => {
            // children 走 components 编辑
            return key !== 'children';
        })
        .map((key) => {
            const propValue = props[key];
            if (key.startsWith('v-model')) {
                if (isJSExpression(propValue))
                    return `${key}="${propValue.value}"`;

                else
                    return `${key}="${propValue}"`;
            }
            if (isJSExpression(propValue))
                return `:${key}="${propValue.value?.trim()}"`;

            if (key.match(/^on[A-Z]/)) {
                const eventName = camelCase(key.replace(/^on/, ''));
                return `@${eventName}="${genEventName(key, refName)}"`;
            }

            if (isJSFunction(propValue))
                return `:${key}="${propValue.value}"`;

            return normalProps(key, propValue);
        }).filter(Boolean);
}

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
    if (!isNil(nodeSchema.condition) && isJSExpression(nodeSchema.condition)) {
        directives.unshift({
            name: 'v-if',
            value: nodeSchema.condition.value,
            modifiers: [],
        });
    }

    return directives;
}

function handleComponentRef(nodeSchema: IPublicTypeNodeSchema, componentRefs: Set<string>) {
    if (componentRefs.has(nodeSchema.ref))
        return `ref="${nodeSchema.ref}RefEl"`;
    return '';
}

function compileLoop(nodeSchema: IPublicTypeNodeData) {
    if (isNodeSchema(nodeSchema) && nodeSchema.loop) {
        const keyProp = nodeSchema.props?.key || 'index';
        const item = nodeSchema.loopArgs?.[0] || 'item';
        const index = nodeSchema.loopArgs?.[1] || 'index';
        let loopVariable: string;
        if (isJSExpression(nodeSchema.loop))
            loopVariable = nodeSchema.loop.value;

        else
            loopVariable = JSON.stringify(nodeSchema.loop).replace(/\"/g, '\'');

        return `v-for="(${item}, ${index}) in ${loopVariable}" :key="${keyProp}" `;
    }
    return '';
}

function compileJSExpression(expression: IPublicTypeJSExpression) {
    return `{{${expression.value}}}`;
}

function compileNodeSchema(nodeSchema: IPublicTypeNodeData, componentRefs: Set<string>) {
    if (isNodeSchema(nodeSchema)) {
        const children = genNodeSchemaChildren(nodeSchema);
        if (nodeSchema.condition === false)
            return '';
        return `<${nodeSchema.componentName} ${handleComponentRef(nodeSchema, componentRefs)} ${compileDirectives(
            getDirectives(nodeSchema),
        ).join(' ')} ${compileLoop(nodeSchema)} ${compileProps(nodeSchema.props, nodeSchema.ref).join(' ')} ${
            !isEmpty(children)
                ? `>
                    ${children
                        .map((children) => {
                            return compileNodeData(children, componentRefs);
                        })
                        .join('\n')}
                    </${nodeSchema.componentName}>`
                : ' />'
        }`;
    }
    if (isJSExpression(nodeSchema))
        return compileJSExpression(nodeSchema);

    return nodeSchema;
}

function compileDOMText(domText: IPublicTypeDOMText) {
    return domText;
}

function compileJsSlot(slot: IPublicTypeJSSlot, componentRefs: Set<string>): string {
    const slotContent = slot.value;
    return `<template ${slot.name ? `#${slot.name}` : ''}${
        slot.params ? `="${slot.params.join(', ')}"` : ''
    }>
    ${(!isArray(slotContent) ? [slotContent] : slotContent)
        .map(item => compileNodeSchema(item, componentRefs))
        .join('\n')}
    </template>`;
}

function compileNodeData(nodeData: IPublicTypeNodeData, componentRefs: Set<string>): string {
    if (isNodeSchema(nodeData))
        return compileNodeSchema(nodeData, componentRefs);

    else if (isJSExpression(nodeData))
        return compileJSExpression(nodeData);

    else if (isJSSlot(nodeData))
        return compileJsSlot(nodeData, componentRefs);

    else if (isDOMText(nodeData))
        return compileDOMText(nodeData);

    return '';
}

export function genPageTemplate(rootSchema: IPublicTypeRootSchema, componentRefs: Set<string>) {
    const nodeData = Array.isArray(rootSchema.children) ? rootSchema.children : [rootSchema.children];
    return `<template>
        <div class="letgo-page" ${compileProps(merge(rootSchema.defaultProps, rootSchema.props)).join(' ')}>
            ${nodeData.map(item => compileNodeData(item, componentRefs)).join('\n')}
        </div>
    </template>`;
}
