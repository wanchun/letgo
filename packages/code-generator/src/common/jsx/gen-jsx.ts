import type {
    IPublicTypeCompositeValue,
    IPublicTypeDOMText,
    IPublicTypeJSExpression,
    IPublicTypeJSFunction,
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
import { ensureArray, traverseNodePropsSlot, traverseNodeSchema } from '@webank/letgo-common';
import { compilerEventHandlers, funcSchemaToFunc } from '../events';
import type { Context } from '../types';
import { compileDirectives } from './directives';

function genPropSlotName(key: string, refName: string) {
    return camelCase(`${refName}_${key}_slots`);
}
function formatProps(key: string | number, value: any, refName: string): any {
    console.log(11111);
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
        const valueKeys = Object.keys(value);
        if (key === 'style' && valueKeys.length === 0)
            return '';

        return `
        {
            ${valueKeys.map((key) => {
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

    if (typeof value === 'string' && value)
        return `${key}="${value}"`;

    if (value) {
        value = formatProps(key, value, refName);
        return value ? `${key}={${value}}` : '';
    }

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
            if (isJSSlot(propValue)) {
                // 顶层 slot props 走组件 slot 模式
                return null;
            }

            if (key.startsWith('v-model')) {
                const value = isJSExpression(propValue) ? propValue.value : propValue;
                if (value)
                    return `${key}={${value}}`;

                return null;
            }
            if (isJSExpression(propValue)) {
                const value = propValue.value?.trim();
                if (!value)
                    return null;
                return `${key}={${value}}`;
            }

            if (key.match(/^on[A-Z]/))
                return `${key}={[${((propValue || []) as IPublicTypeJSFunction[]).map(funcSchemaToFunc).join(',')}]}`;

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
    if (componentRefs.has(nodeSchema.ref)) {
        const refFor = nodeSchema.loop ? 'ref_for' : '';
        return `ref={${nodeSchema.ref}RefEl} ${refFor}`;
    }
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

function genLoopParams(nodeSchema: IPublicTypeNodeData) {
    if (isNodeSchema(nodeSchema) && nodeSchema.loop) {
        const item = nodeSchema.loopArgs?.[0] || 'item';
        const index = nodeSchema.loopArgs?.[1] || 'index';
        return [item, index];
    }
    return [];
}

function wrapLoop(code: string, nodeSchema: IPublicTypeNodeData, isRoot = false) {
    if (isNodeSchema(nodeSchema) && nodeSchema.loop) {
        const [item, index] = genLoopParams(nodeSchema);
        const keyProp = nodeSchema.props?.key || index;
        let loopVariable: string;
        if (isJSExpression(nodeSchema.loop))
            loopVariable = nodeSchema.loop.value;

        else
            loopVariable = JSON.stringify(nodeSchema.loop).replace(/\"/g, '\'');

        const result = `(${loopVariable}).map((${item}, ${index}) => ${code.replace(nodeSchema.componentName, `${nodeSchema.componentName} key={${keyProp}}`)})`;

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
        if (isRoot)
            return result;

        return `{ ${result} }`;
    }
    return code;
}

function compileNodeSchema(ctx: Context, nodeSchema: IPublicTypeNodeData, componentRefs: Set<string>, isRoot = false) {
    if (isNodeSchema(nodeSchema)) {
        if (nodeSchema.condition === false)
            return '';
        const loopParams = genLoopParams(nodeSchema);
        if (nodeSchema.loop)
            ctx.scope = ctx.scope.concat(loopParams);

        const children = genNodeSchemaChildren(nodeSchema);
        const events = compilerEventHandlers(ctx, nodeSchema.events || []);
        const excludeSlotChildren = children.filter(item => !isJSSlot(item));
        const code = `<${nodeSchema.componentName}
            ${handleComponentRef(nodeSchema, componentRefs)}
            ${compileDirectives(nodeSchema.directives || []).join(' ')}
            ${compileProps(nodeSchema.props, nodeSchema.ref).join(' ')} 
            ${Object.keys(events).map((eventName) => {
                return `${eventName}={[${events[eventName].join(', ')}]}`;
            }).join(' ')}
            ${genSlotDirective(ctx, nodeSchema, componentRefs)} 
            ${!isEmpty(excludeSlotChildren)
                ? `>
                    ${excludeSlotChildren
                        .map((item) => {
                            return compileNodeData(ctx, item, componentRefs);
                        })
                        .join('\n')}
                    </${nodeSchema.componentName}>`
                : ' />'
        }`;
        if (nodeSchema.loop) {
            ctx.scope = ctx.scope.splice(0, ctx.scope.length - loopParams.length);
            return wrapLoop(code, nodeSchema, isRoot);
        }

        return wrapCondition(code, nodeSchema.condition, isRoot);
    }
    if (isJSExpression(nodeSchema))
        return compileJSExpression(nodeSchema);

    return nodeSchema;
}

function compileDOMText(domText: IPublicTypeDOMText) {
    return domText;
}

function compileSingleNodeData(ctx: Context, nodeData: IPublicTypeNodeData, componentRefs: Set<string>, isRoot = false) {
    if (isNodeSchema(nodeData))
        return compileNodeSchema(ctx, nodeData, componentRefs, isRoot);

    else if (isJSExpression(nodeData))
        return compileJSExpression(nodeData);

    else if (isDOMText(nodeData))
        return compileDOMText(nodeData);

    return '';
}

function compileNodeData(ctx: Context, nodeData: IPublicTypeNodeData | IPublicTypeNodeData[], componentRefs: Set<string>, isRoot = false): string | string[] {
    if (isArray(nodeData))
        return nodeData.map(item => compileSingleNodeData(ctx, item, componentRefs, isRoot));
    return compileSingleNodeData(ctx, nodeData, componentRefs, isRoot);
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

function genSlotDirective(ctx: Context, item: IPublicTypeNodeSchema, componentRefs: Set<string>) {
    let result = '';
    const slotDefine: Record<string, string> = {};
    const slotChildren = genNodeSchemaChildren(item).filter(item => isJSSlot(item));
    if (slotChildren.length) {
        const hasMoreComp = slotChildren.length > 1;
        slotDefine.default = `
        () => {
            return ${wrapFragment(compileNodeData(ctx, slotChildren, componentRefs, !hasMoreComp))}
        }
        `;
    }
    Object.keys(item.props).forEach((key) => {
        const cur = item.props[key];
        if (isJSSlot(cur)) {
            const slotName = cur.name || key;
            const params = ensureArray(cur.params);
            const hasMoreComp = Array.isArray(cur.value) && cur.value.length > 1;
            ctx.scope = ctx.scope.concat(params);
            slotDefine[slotName] = `
            (${params.join(', ')}) => {
                return ${wrapFragment(compileNodeData(ctx, cur.value, componentRefs, !hasMoreComp))}
            }
            `;
            ctx.scope.splice(0, ctx.scope.length - params.length);
        }
    });
    if (Object.keys(slotDefine).length) {
        result = `
        v-slots={{
            ${Object.keys(slotDefine).map((key) => {
                return `${key}: ${slotDefine[key]},`;
            }).join('\n')}
        }}
        `;
    }
    return result;
}

export function genSlots(
    ctx: Context,
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    componentRefs: Set<string>,
) {
    const slots: string[] = [];
    traverseNodeSchema(nodeData, (item) => {
        traverseNodePropsSlot(Object.keys(item.props).reduce((acc, cur) => {
            if (!isJSSlot(item.props[cur]))
                acc[cur] = item.props[cur];

            return acc;
        }, {} as Record<string, any>), (key: string, value: IPublicTypeJSSlot) => {
            const params = ensureArray(value.params);
            const hasMoreComp = Array.isArray(value.value) && value.value.length > 1;
            ctx.scope = ctx.scope.concat(params);
            slots.push(`
            const ${genPropSlotName(key, item.ref)} = (${params.join(', ')}) => {
                return ${wrapFragment(compileNodeData(ctx, value.value, componentRefs, !hasMoreComp))}
            }
            `);
            ctx.scope = ctx.scope.splice(0, ctx.scope.length - params.length);
        });
    });

    return slots;
}

export function genPageJsx(ctx: Context, rootSchema: IPublicTypeRootSchema, componentRefs: Set<string>) {
    const nodeData = Array.isArray(rootSchema.children) ? rootSchema.children : [rootSchema.children];
    return `return () => {
        return <div class="letgo-page" ${compileProps(merge(rootSchema.defaultProps, rootSchema.props)).join(' ')}>
            ${nodeData.map(item => compileNodeData(ctx, item, componentRefs)).join('\n')}
        </div>
    }`;
}
