import type {
    IPublicTypeCompositeValue,
    IPublicTypeDOMText,
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
import { traverseNodePropsSlot, traverseNodeSchema } from '../helper';
import { compileDirectives } from './directives';

function genPropSlotName(key: string, refName: string) {
    return camelCase(`${refName}_${key}_slots`);
}
function formatProps(key: string | number, value: any, refName: string): any {
    if (isJSSlot(value))
        return genPropSlotName(key as string, refName);

    if (isJSExpression(value))
        return value.value;

    if (isJSFunction(value)) {
        return value.value;
    }
    else if (Array.isArray(value)) {
        return `
        [
            ${value.map((item, index) => formatProps(index, item, refName)).join(',')}
        ]
        `;
    }
    else if (isPlainObject(value)) {
        return `
        {
            ${Object.keys(value).map((key) => {
                return `${key}: ${formatProps(key, value[key], refName)}`;
            }).join(', ')}
        }
        `;
    }
    else if (typeof value === 'string') {
        return JSON.stringify(value);
    }

    return value;
}

function normalProps(key: string, value: any, refName: string) {
    if (typeof value === 'number')
        return `${key}={${value}}`;

    if (typeof value === 'boolean') {
        if (value)
            return key;

        return `${key}={false}`;
    }
    if (value == null)
        return '';

    if (typeof value === 'string')
        return `${key}="${value}"`;

    if (value)
        return `${key}={${formatProps(key, value, refName)}}`;

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
            if (isJSSlot(propValue))
                return `${key}={${genPropSlotName(key, refName)}}`;

            if (key.startsWith('v-model')) {
                const [name, arg] = key.split(':');
                const value = isJSExpression(propValue) ? propValue.value : propValue;
                return `${name}={${arg ? `[${value}, '${arg}']` : value}}`;
            }
            if (isJSExpression(propValue))
                return `${key}={${propValue.value?.trim()}}`;

            if (key.match(/^on[A-Z]/))
                return `${key}={${genEventName(key, refName)}}`;

            if (isJSFunction(propValue))
                return `${key}={${propValue.value}`;

            return normalProps(key, propValue, refName);
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

function handleComponentRef(nodeSchema: IPublicTypeNodeSchema, componentRefs: Set<string>) {
    if (componentRefs.has(nodeSchema.ref))
        return `ref={${nodeSchema.ref}RefEl}`;
    return '';
}

function compileJSExpression(expression: IPublicTypeJSExpression) {
    return `{${expression.value}}`;
}

function wrapCondition(code: string, condition: IPublicTypeCompositeValue, isRoot = false) {
    if (!isNil(condition)) {
        if (isJSExpression(condition)) {
            if (isRoot) {
                return `
                if (${condition.value}) {
                    return ${code}
                }
                return null;
                `;
            }
            return `{
                ${condition.value} && ${code}
            }`;
        }
        if (condition)
            return code;
        return null;
    }
    return code;
}

function wrapLoop(code: string, nodeSchema: IPublicTypeNodeData, isRoot = false) {
    if (isNodeSchema(nodeSchema) && nodeSchema.loop) {
        const keyProp = nodeSchema.props?.key || 'index';
        const item = nodeSchema.loopArgs?.[0] || 'item';
        const index = nodeSchema.loopArgs?.[1] || 'index';
        let loopVariable: string;
        if (isJSExpression(nodeSchema.loop))
            loopVariable = nodeSchema.loop.value;

        else
            loopVariable = JSON.stringify(nodeSchema.loop).replace(/\"/g, '\'');

        const result = `(${loopVariable}).map((${item}, ${index}) => ${code.replace(nodeSchema.componentName, `${nodeSchema.componentName} key={${keyProp}}`)}})`;

        if (isJSExpression(nodeSchema.condition)) {
            if (isRoot) {
                return `
                    if (${nodeSchema.condition.value}) {
                        return ${result}
                    }
                    return null;
                `;
            }
            return `{${nodeSchema.condition.value} && ${result}}`;
        }
        return result;
    }
    return code;
}

function genSlotName(nodeSchema: IPublicTypeNodeData) {
    if (isNodeSchema(nodeSchema))
        return `${nodeSchema.ref.trim()}Slots`;

    return '';
}

function genSlotDirective(nodeSchema: IPublicTypeNodeData, children: IPublicTypeNodeData[]) {
    if (isNodeSchema(nodeSchema) && children.find(item => isJSSlot(item)))
        return `v-slots={${genSlotName(nodeSchema)}}`;

    return '';
}

function compileNodeSchema(nodeSchema: IPublicTypeNodeData, componentRefs: Set<string>, isRoot = false) {
    if (isNodeSchema(nodeSchema)) {
        if (nodeSchema.condition === false)
            return '';

        const children = genNodeSchemaChildren(nodeSchema);
        const excludeSlotChildren = children.filter(item => !isJSSlot(item));
        const code = `<${nodeSchema.componentName}
            ${handleComponentRef(nodeSchema, componentRefs)}
            ${compileDirectives(nodeSchema.directives || []).join(' ')}
            ${compileProps(nodeSchema.props, nodeSchema.ref).join(' ')} 
            ${genSlotDirective(nodeSchema, children)} 
            ${!isEmpty(excludeSlotChildren)
                ? `>
                    ${excludeSlotChildren
                        .map((item) => {
                            return compileNodeData(item, componentRefs);
                        })
                        .join('\n')}
                    </${nodeSchema.componentName}>`
                : ' />'
        }`;
        if (nodeSchema.loop)
            return wrapLoop(code, nodeSchema, isRoot);

        return wrapCondition(code, nodeSchema.condition, isRoot);
    }
    if (isJSExpression(nodeSchema))
        return compileJSExpression(nodeSchema);

    return nodeSchema;
}

function compileDOMText(domText: IPublicTypeDOMText) {
    return domText;
}

function compileNodeData(nodeData: IPublicTypeNodeData | IPublicTypeNodeData[], componentRefs: Set<string>, isRoot = false): string {
    if (isArray(nodeData))
        return nodeData.map(item => compileNodeData(item, componentRefs)).join('\n');
    if (isNodeSchema(nodeData))
        return compileNodeSchema(nodeData, componentRefs, isRoot);

    else if (isJSExpression(nodeData))
        return compileJSExpression(nodeData);

    else if (isDOMText(nodeData))
        return compileDOMText(nodeData);

    return '';
}

function wrapFragment(children: string | string[]) {
    if (typeof children === 'string')
        return children;

    if (children.length > 1) {
        return `<>
            ${children.join('\n')}
        </>
        `;
    }
    return children.length ? children[0] : '';
}

export function genSlots(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    componentRefs: Set<string>,
) {
    const slots: string[] = [];
    traverseNodeSchema(nodeData, (item) => {
        const slotDefine = genNodeSchemaChildren(item).reduce((acc, cur) => {
            if (isJSSlot(cur)) {
                const slotName = cur.name || 'default';
                const params = cur.params ? cur.params.join(', ') : '';
                acc[slotName] = `
                (${params}) => {
                    return ${wrapFragment(compileNodeData(cur.value, componentRefs, true))}
                }
                `;
            }
            return acc;
        }, {} as Record<string, string>);
        if (Object.keys(slotDefine).length) {
            slots.push(`
            const ${genSlotName(item)} = {
                ${Object.keys(slotDefine).map((key) => {
                    return `${key}: ${slotDefine[key]},`;
                }).join('\n')}
            };
            `);
        }

        traverseNodePropsSlot(item.props, (key: string, value: IPublicTypeJSSlot) => {
            const params = value.params ? value.params.join(', ') : '';
            slots.push(`
            const ${genPropSlotName(key, item.ref)} = (${params}) => {
                return ${wrapFragment(compileNodeData(value.value, componentRefs, true))}
            }
            `);
        });
    });
    return slots;
}

export function genPageJsx(rootSchema: IPublicTypeRootSchema, componentRefs: Set<string>) {
    const nodeData = Array.isArray(rootSchema.children) ? rootSchema.children : [rootSchema.children];
    return `return () => {
        return <div class="letgo-page" ${compileProps(merge(rootSchema.defaultProps, rootSchema.props)).join(' ')}>
            ${nodeData.map(item => compileNodeData(item, componentRefs)).join('\n')}
        </div>
    }`;
}