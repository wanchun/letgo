import type { INode, Prop } from '@webank/letgo-designer';
import type {
    IEventHandler,
    IPublicTypeCompositeValue,
    IPublicTypeJSExpression,
    IPublicTypeJSFunction,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
    IPublicTypeSlotSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isDOMText,
    isJSExpression,
    isJSFunction,
    isJSSlot,
    isNodeSchema,
    isSlotSchema,
} from '@webank/letgo-types';
import { camelCase, isArray, isFunction, isNil, isPlainObject, isString } from 'lodash-es';
import type {
    Component,
    ComputedRef,
    Fragment,
    Ref,
    Slot,
    VNode,
} from 'vue';
import {
    computed,
    createTextVNode,
    getCurrentInstance,
    h,
    ref,
    toDisplayString,
    toValue,
} from 'vue';
import { LogIdType } from '@webank/letgo-common';
import type { RendererContext } from '../context';
import { provideRenderContext, useRendererContext } from '../context';
import { eventHandlersToJsFunction, funcSchemaToFunc, parseExpression, parseSchema } from '../parse';
import type { BlockScope, MaybeArray, RuntimeScope } from '../utils';
import {
    ensureArray,
    mergeScope,
    parseSlotScope,
} from '../utils';
import { HtmlCompWhitelist, type PropSchemaMap, type RendererProps, type SlotSchemaMap } from './base';
import { Live } from './live';

export function isNodeData(val: unknown): val is IPublicTypeNodeData | IPublicTypeNodeData[] {
    if (Array.isArray(val))
        return val.every(item => isNodeData(item));

    return isDOMText(val) || isNodeSchema(val) || isJSExpression(val);
}

/**
 * 渲染节点 vnode
 * @param schema - 节点 schema
 * @param base - 节点 leaf 组件，根据 designMode 的不同而不同
 * @param blockScope - 节点块级作用域
 * @param comp - 节点渲染的组件，若不传入，则根据节点的 componentName 推断
 */
function render({
    scope,
    context,
    schema,
    components,
    base,
    blockScope,
    comp,
    componentId,
}: {
    scope: RuntimeScope;
    context: Record<string, unknown>;
    schema: IPublicTypeNodeData;
    base: Component;
    components: Record<string, Component>;
    blockScope?: MaybeArray<BlockScope | undefined | null>;
    comp?: Component | string;
    componentId?: string;
}) {
    const mergedScope = mergeScope(scope, blockScope);

    // 若 schema 不为 IPublicTypeNodeSchema，则直接渲染
    if (isString(schema)) {
        return createTextVNode(schema);
    }
    else if (isJSExpression(schema)) {
        const result = parseExpression(schema, {
            ...context,
            ...mergedScope,
        }, {
            idType: LogIdType.COMPONENT,
            id: componentId,
            paths: ['children'],
            content: schema.value,
        });
        if (result == null)
            return null;

        return createTextVNode(toDisplayString(result));
    }

    // 若不传入 comp，则根据节点的 componentName 推断
    if (!comp) {
        const { componentName } = schema;
        comp = components[componentName] || components[`${componentName}Renderer`] || (HtmlCompWhitelist.includes(componentName) ? componentName : null);
    }

    if (!comp)
        return h('div', 'component not found');

    // 渲染 leaf 组件
    return h(base, {
        key: schema.id,
        comp,
        scope: mergedScope,
        schema,
    } as any);
}

export function buildEvents(events: IEventHandler[] = []) {
    return eventHandlersToJsFunction(events);
}

/**
 * 构建当前节点的 schema，获取 schema 的属性及插槽
 *
 * - node 的 children 会被处理成默认插槽
 * - 类型为 IPublicTypeJSSlot 的 prop 会被处理为具名插槽
 * - prop 和 node 中同时存在 children 时，prop children 会覆盖 node children
 * - className prop 会被处理为 class prop
 */
export function buildSchema(schema: IPublicTypeNodeSchema, node?: INode) {
    const slotProps: SlotSchemaMap = {};
    const normalProps: PropSchemaMap = {};

    // 处理节点默认插槽，可能会被属性插槽覆盖
    // 非空时才处理，不然会导致组件slots.default默认有值，可能导致组件渲染异常
    if (!isNil(schema.children))
        slotProps.default = ensureArray(schema.children);

    Object.entries(schema.props ?? {}).forEach(([key, val]) => {
        if (isJSSlot(val)) {
            // 处理具名插槽
            const prop = node?.getProp(key, false);
            if (prop && prop.slotNode) {
                // design 模式，从 prop对应的 slotNode 对象获取 schema
                const slotSchema = prop.slotNode.exportSchema(
                    IPublicEnumTransformStage.Render,
                );
                if (isSlotSchema(slotSchema))
                    slotProps[slotSchema.name || key] = slotSchema;
            }
            else if (val.value) {
                // live 模式，直接获取 schema 值，若值为空则不渲染插槽
                slotProps[val.name || key] = {
                    componentName: 'Slot',
                    title: val.title,
                    name: val.name,
                    props: {
                        params: val.params,
                    },
                    children: ensureArray(val.value),
                };
            }
        }
        else if (key === 'className') {
            // 适配 react className
            normalProps.class = val;
        }
        else if (key === 'children' && isNodeData(val)) {
            // 处理属性中的默认插槽，属性的重默认插槽会覆盖节点 children 插槽
            slotProps.default = ensureArray(val);
        }
        else {
            // 处理普通属性
            normalProps[key] = val;
        }
    });

    return {
        props: {
            ...normalProps,
            ...buildEvents(schema.events),
        },
        slots: slotProps,
    };
}

/**
 * 将单个属性 schema 转化成真实值
 *
 * @param schema - 属性 schema
 * @param scope - 当前作用域
 * @param blockScope - 当前块级作用域
 * @param prop - 属性对象，仅在 design 模式下有值
 */

function buildProp({
    context,
    render,
    schema,
    scope,
    pickPath,
    blockScope,
    prop,
}: {
    context: Record<string, unknown>;
    render: (
        nodeSchema: IPublicTypeNodeData,
        blockScope?: MaybeArray<BlockScope | undefined | null>,
        comp?: Component,
    ) => VNode | null;
    schema: unknown;
    scope: RuntimeScope;
    pickPath: (string | number)[];
    blockScope?: BlockScope | null;
    prop?: Prop | null;
}): any {
    if (isJSExpression(schema)) {
        return parseExpression(schema, { ...context, ...scope }, {
            idType: LogIdType.COMPONENT,
            id: pickPath[0],
            paths: pickPath.slice(1),
            content: schema.value,
        });
    }
    else if (isJSFunction(schema)) {
        return funcSchemaToFunc({
            schema,
            exeCtx: context,
            infoCtx: {
                idType: LogIdType.COMPONENT,
                id: pickPath[0],
                paths: pickPath.slice(1),
                content: schema.value,
            },
            scope,
        });
    }
    else if (isJSSlot(schema)) {
        // 处理属性插槽
        let slotParams: string[];
        let slotSchema: IPublicTypeSlotSchema | IPublicTypeNodeData | IPublicTypeNodeData[];
        if (prop?.slotNode) {
            // design 模式，从 prop 中导出 schema
            slotSchema = prop.slotNode.exportSchema(
                IPublicEnumTransformStage.Render,
            );
            slotParams = isSlotSchema(slotSchema) ? slotSchema.props.params ?? [] : [];
        }
        else {
            // live 模式，直接获取 schema 值
            slotSchema = ensureArray(schema.value);
            slotParams = schema.params ?? [];
        }

        // 返回 slot 函数
        return (...args: unknown[]) => {
            let slotScope: Record<string, any>;
            // design 模式
            if (prop) {
                slotScope = {
                    __slot_args: args,
                };
            }
            else {
                slotScope = parseSlotScope(args, slotParams);
            }

            const vNodes: VNode[] = [];
            ensureArray(slotSchema).forEach((item) => {
                const vnode = render(item, [blockScope, slotScope]);
                ensureArray(vnode).forEach(item => vNodes.push(item));
            });
            return vNodes;
        };
    }
    else if (isArray(schema)) {
        // 属性值为 array，递归处理属性的每一项
        return schema.map((item, idx) =>
            buildProp({ context, render, schema: item, scope, pickPath: [...pickPath, idx], blockScope, prop: prop?.get(idx, false) }),
        );
    }
    else if (schema && isPlainObject(schema)) {
        // 属性值为 object，递归处理属性的每一项
        const res: Record<string, unknown> = {};
        Object.keys(schema).forEach((key) => {
            if (key.startsWith('__'))
                return;
            const val = schema[key as keyof typeof schema];
            const childProp = prop?.get(key, false);
            res[key] = buildProp({ context, render, schema: val, scope, pickPath: [...pickPath, key], blockScope, prop: childProp });
        });
        return res;
    }
    return schema;
}

/**
 * 构建 ref prop，将 string ref 其转化为 function
 *
 * @param schema - prop schema
 * @param scope - 当前作用域
 * @param blockScope - 当前块级作用域
 * @param prop - 属性对象，仅在 design 模式下有值
 */
function buildRefProp({
    context,
    render,
    schema,
    pickPath,
    scope,
    blockScope,
    prop,
}: {
    context: Record<string, unknown>;
    render: (
        nodeSchema: IPublicTypeNodeData,
        blockScope?: MaybeArray<BlockScope | undefined | null>,
        comp?: Component,
    ) => VNode | null;
    schema: unknown;
    pickPath: (string | number)[];
    scope: RuntimeScope;
    blockScope?: BlockScope | null;
    prop?: Prop | null;
}): any {
    if (isString(schema)) {
        // Tip: 不知道用于什么场景，先过滤 scope.$ 避免出现应用异常
        if (!scope.$)
            return schema;

        const field = schema;
        let lastInst: unknown = null;
        return (inst: unknown): void => {
            let refs = scope.$.refs;
            if (Object.keys(refs).length === 0)
                refs = scope.$.refs = {};

            if (isNil(scope.__loopRefIndex)) {
                refs[field] = inst;
                if (field in scope)
                    scope[field] = inst;
            }
            else {
                let target = refs[field] as unknown[];
                if (!Array.isArray(target)) {
                    target = refs[field] = [];
                    if (field in scope)
                        target = scope[field] = target;
                }
                else if (field in scope) {
                    const scopeTarget = scope[field];
                    if (
                        !Array.isArray(scopeTarget)
                        || toValue(scopeTarget) !== target
                    )
                        target = scope[field] = target;
                    else
                        target = scopeTarget;
                }
                if (isNil(inst)) {
                    const idx = target.indexOf(lastInst);
                    if (idx >= 0)
                        target.splice(idx, 1);
                }
                else {
                    target[scope.__loopRefIndex] = inst;
                }
            }
            lastInst = inst;
        };
    }
    else {
        const propValue = buildProp({ context, render, schema, pickPath, scope, blockScope, prop });
        return isString(propValue)
            ? buildRefProp({ context, render, schema: propValue, pickPath, scope, blockScope, prop })
            : propValue;
    }
}

/**
 * 处理属性 schema，主要处理的目标：
 * - ref 逻辑 (合并 ref function)
 * - 事件绑定逻辑 (重复注册的事件转化为数组)
 * - 双向绑定逻辑 (v-model)
 * - 指令绑定逻辑 TODO
 * @param target - 组件属性目标对象
 * @param key - 属性名
 * @param val - 属性值
 */
function processProp(
    target: Record<string, unknown>,
    key: string,
    val: unknown,
) {
    if (key.startsWith('v-model')) {
        // 双向绑定逻辑
        const matched = key.match(/v-model(?::(\w+))?$/);
        if (!matched)
            return target;

        const valueProp = camelCase(matched[1] ?? 'modelValue');
        const eventProp = `onUpdate:${valueProp}`;

        if ((val as IPublicTypeJSExpression)?.value) {
            const updateEventFn: IPublicTypeJSFunction = {
                type: 'JSFunction',
                value: `function ($event) {${(val as IPublicTypeJSExpression).value.trim()} = $event}`,
            };
            target[eventProp]
                = eventProp in target
                    ? ensureArray(target[eventProp]).concat(updateEventFn)
                    : updateEventFn;
        }
        target[valueProp] = val;
    }
    else if (key.startsWith('v-') && isJSExpression(val)) {
        // TODO: 指令绑定逻辑
    }
    else if (key.match(/^on[A-Z]/) && isJSFunction(val)) {
        // 事件绑定逻辑

        // normalize: onUpdateXxx => onUpdate:xxx
        const matched = key.match(/onUpdate(?::?(\w+))$/);
        if (matched)
            key = `onUpdate:${camelCase(matched[1])}`;

        // 若事件名称重复，则自动转化为数组
        target[key]
            = key in target ? ensureArray(target[key]).concat(val) : val;
    }
    else if (key === 'ref' && 'ref' in target) {
        // ref 合并逻辑
        const sourceRef = val;
        const targetRef = target.ref;
        if (isFunction(targetRef) && isFunction(sourceRef)) {
            target.ref = (...args: unknown[]) => {
                sourceRef(...args);
                targetRef(...args);
            };
        }
        else {
            target.ref = [targetRef, sourceRef].filter(isFunction).pop();
        }
    }
    else {
        target[key] = val;
    }
}

/**
 * 构建属性，将整个属性 schema 转化为真实的属性值
 * @param propsSchema - 属性 schema
 * @param blockScope - 当前块级作用域
 * @param extraProps - 运行时附加属性
 */
export function buildProps({
    componentId,
    context,
    scope,
    propsSchema,
    render,
    blockScope,
    extraProps,
    node,
}: {
    componentId: string;
    context: Record<string, unknown>;
    scope: RuntimeScope;
    propsSchema: Record<string, unknown>;
    render: (
        nodeSchema: IPublicTypeNodeData,
        blockScope?: MaybeArray<BlockScope | undefined | null>,
        comp?: Component,
    ) => VNode | null;
    blockScope?: BlockScope | null;
    extraProps?: Record<string, unknown>;
    node?: INode | null;
}): any {
    // 属性预处理
    const processed: Record<string, unknown> = {};
    Object.keys(propsSchema).forEach((propKey) => {
        processProp(processed, propKey, propsSchema[propKey]);
    });

    // 将属性 schema 转化成真实的属性值
    const parsedProps: Record<string, unknown> = {};
    const mergedScope = blockScope ? mergeScope(scope, blockScope) : scope;

    Object.keys(processed).forEach((propName) => {
        const schema = processed[propName];
        parsedProps[propName]
            = propName === 'ref'
                ? buildRefProp({
                    context,
                    render,
                    schema,
                    pickPath: [componentId, propName],
                    scope: mergedScope,
                    blockScope,
                    prop: node?.getProp(propName, false),
                })
                : buildProp({
                    context,
                    render,
                    schema,
                    pickPath: [componentId, propName],
                    scope: mergedScope,
                    blockScope,
                    prop: node?.getProp(propName, false),
                });
    });

    // 应用运行时附加的属性值
    if (extraProps) {
        Object.keys(extraProps).forEach((propKey) => {
            processProp(parsedProps, propKey, extraProps[propKey]);
        });
    }

    return parsedProps;
}

export function buildLoop(scope: RuntimeScope, ctx: Record<string, any>, schema: IPublicTypeNodeSchema) {
    const loop = ref<IPublicTypeCompositeValue>();
    const loopArgs = ref(['item', 'index']) as Ref<[string, string]>;

    if (schema.loop)
        loop.value = schema.loop;
    if (schema.loopArgs) {
        schema.loopArgs.forEach((v, i) => {
            loopArgs.value[i] = v;
        });
    }

    return {
        loop: computed(() => {
            if (!loop.value)
                return null;
            return parseSchema(loop.value, [schema.id, 'loop'], { ...ctx, ...scope });
        }),
        loopArgs,
    };
}

export function buildShow(scope: RuntimeScope | ComputedRef<RuntimeScope>, ctx: Record<string, any>, schema: IPublicTypeNodeSchema) {
    const condition = ref<unknown>(schema.condition ?? true);

    const show = computed(() => {
        const { value: showCondition } = condition;
        if (typeof showCondition === 'boolean')
            return showCondition;
        return !!parseSchema(showCondition, [schema.id, 'condition'], { ...toValue(scope), ...ctx });
    });

    return {
        show,
        condition: (val: unknown) => {
            condition.value = val;
        },
    };
}

/**
 * 构建所有插槽 schema，将 schema 构建成 slot 函数
 * @param slots - 插槽 schema
 * @param blockScope - 插槽块级作用域
 */
export function buildSlots(
    render: (
        nodeSchema: IPublicTypeNodeData,
        blockScope?: MaybeArray<BlockScope | undefined | null>,
        comp?: Component,
    ) => VNode | null,
    slots: SlotSchemaMap,
    blockScope?: BlockScope | null,
): Record<string, Slot> {
    return Object.keys(slots).reduce((prev, next) => {
        const slotSchema = slots[next];
        if (!slotSchema)
            return prev;

        const renderSlot = (...args: unknown[]) => {
            const vNodes: VNode[] = [];
            if (Array.isArray(slotSchema)) {
                slotSchema.forEach((item) => {
                    const vNode = render(item, blockScope);
                    if (vNode)
                        vNodes.push(vNode);
                });
            }
            else if (slotSchema.id) {
                // 存在 slot id，则当前插槽可拖拽编辑，渲染 Hoc
                const vNode = render(slotSchema, [
                    blockScope,
                    parseSlotScope(args, slotSchema.props.params ?? []),
                    { __slot_args: args },
                ]);
                if (vNode)
                    vNodes.push(vNode);
            }
            else {
                // 不存在 slot id，插槽不可拖拽编辑，直接渲染插槽内容
                ensureArray(slotSchema.children).forEach((item) => {
                    const vNode = render(item, [
                        blockScope,
                        parseSlotScope(args, slotSchema.props.params ?? []),
                    ]);
                    if (vNode)
                        vNodes.push(vNode);
                });
            }
            return vNodes;
        };
        prev[next] = renderSlot;
        return prev;
    }, {} as Record<string, Slot>);
}

export function useLeaf(scope: Ref<RuntimeScope>, context: Record<string, unknown>, componentId: string) {
    const { components, __BASE_COMP } = useRendererContext();

    /**
     * 渲染节点vnode (live 模式)
     * @param nodeSchema - 节点 schema
     * @param blockScope - 节点块级作用域
     * @param comp - 节点渲染的组件，若不传入，则根据节点的 componentName 推断
     */
    const renderComp = (
        nodeSchema: IPublicTypeNodeData,
        blockScope?: MaybeArray<BlockScope | undefined | null>,
        comp?: Component,
    ): VNode | null => {
        return render({
            scope: scope.value,
            context,
            schema: nodeSchema,
            components: components.value,
            base: __BASE_COMP || Live,
            blockScope,
            comp,
            componentId,
        });
    };

    return {
        renderComp,
    };
}

export function useRenderer(props: RendererProps, ctx?: RendererContext) {
    const newCtx = provideRenderContext(props, ctx);

    const renderComp = (
        nodeSchema: IPublicTypeRootSchema,
        comp: Component | typeof Fragment,
    ): VNode => {
        return h(newCtx.__BASE_COMP || Live, {
            key: nodeSchema.id,
            comp,
            scope: null,
            schema: nodeSchema,
        } as any);
    };

    return { renderComp, ctx: newCtx };
}

export function useRootScope(rendererProps: RendererProps) {
    const { __schema: schema } = rendererProps;

    const { props: propsSchema } = schema ?? {};

    // 将全局属性配置应用到 scope 中
    const instance = getCurrentInstance()!;

    // 处理 props
    const props = parseSchema(propsSchema, [schema.id, 'props']) ?? {};
    Object.assign(instance.props, props);

    // 处理 css
    let style: HTMLStyleElement | null = document.querySelector(
        `[data-id=${schema.id}]`,
    );
    if (schema.css) {
        if (!style) {
            style = document.createElement('style');
            style.setAttribute('data-id', schema.id!);
            const head
                = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(style);
        }
        if (style.innerHTML !== schema.css)
            style.innerHTML = schema.css;
    }
    else if (style) {
        style.parentElement?.removeChild(style);
    }
}
