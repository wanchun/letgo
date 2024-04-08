import { eventHandlersToJsFunction, getConvertedExtraKey } from '@webank/letgo-common';
import type { INode, ISlotNode } from '@webank/letgo-designer';
import type {
    BlockScope,
    LeafProps,
    RuntimeScope,
    SlotSchemaMap,
} from '@webank/letgo-renderer';
import {
    buildProps,
    buildSchema,
    buildShow,
    buildSlots,
    ensureArray,
    leafProps,
    mergeScope,
    parseSchema,
    useLeaf,
} from '@webank/letgo-renderer';
import type {
    IEventHandler,
    IPublicTypeComponentAction,
    IPublicTypeComponentInstance,
    IPublicTypeCompositeValue,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isJSSlot,
} from '@webank/letgo-types';
import { isNil } from 'lodash-es';
import type { ComputedRef, Slot } from 'vue';
import {
    Fragment,
    computed,
    defineComponent,
    h,
    inject,
    onUnmounted,
    reactive,
    ref,
    toRef,
} from 'vue';
import { BASE_COMP_CONTEXT } from '../constants';
import { createAction } from './centerAction';

/**
 * 装饰默认插槽，当插槽为空时，渲染插槽占位符，便于拖拽
 *
 * @param slot - 插槽渲染函数
 */
function decorateDefaultSlot(slot?: Slot): Slot {
    return (...args: unknown[]) => {
        const vNodes = slot?.(...args) ?? [];
        if (!vNodes.length) {
            const className = {
                'letgo-container-placeholder': true,
            };
            const placeholder = '拖拽组件或模板到这里';
            vNodes.push(h('div', { class: className }, placeholder));
        }
        return vNodes;
    };
}
function buildCenterAction(node: INode, action?: IPublicTypeComponentAction) {
    const { important = true, condition, content, name } = action;
    if (important && (typeof condition === 'function'
        ? condition(node) !== false
        : condition !== false))
        return createAction(content, name, node);

    return null;
}

function useSchema(props: LeafProps, node: INode) {
    const compProps: {
        [x: string]: unknown;
    } = reactive({});
    const compSlots: SlotSchemaMap = reactive({});

    const result = buildSchema(node.computedSchema, node);

    Object.assign(compProps, result.props);
    Object.assign(compSlots, result.slots);

    const updateEvents = (events: IEventHandler[], oldEvents?: IEventHandler[]) => {
        (props.schema.events || []).concat(oldEvents || []).forEach((item) => {
            delete compProps[item.name];
        });
        Object.assign(compProps, eventHandlersToJsFunction(events));
    };

    return {
        compProps,
        compSlots,
        updateEvents,
    };
}

function useLoop(props: LeafProps, ctx: Record<string, any>) {
    const loop = ref<IPublicTypeCompositeValue>();
    const loopArgs = ref<[string, string]>(['item', 'index']);

    if (props.schema.loop)
        loop.value = props.schema.loop;
    if (props.schema.loopArgs) {
        props.schema.loopArgs.forEach((v, i) => {
            loopArgs.value[i] = v;
        });
    }

    return {
        loop: computed(() => {
            if (!loop.value)
                return null;
            return parseSchema(loop.value, { ...ctx, ...props.scope });
        }),
        loopArgs,
        updateLoop(value: IPublicTypeCompositeValue): void {
            loop.value = value;
        },
        updateLoopArg(value: string | [string, string], idx?: number): void {
            if (Array.isArray(value)) {
                value.forEach((v, i) => {
                    loopArgs.value[i] = v;
                });
            }
            else if (!isNil(idx)) {
                loopArgs.value[idx] = value;
            }
        },
        buildLoopScope(item: unknown, index: number, len: number): BlockScope {
            const offset = props.scope.__loopRefOffset ?? 0;
            const [itemKey, indexKey] = loopArgs.value;
            return {
                [itemKey]: item,
                [indexKey]: index,
                __loopScope: true,
                __loopRefIndex: offset + index,
                __loopRefOffset: len * index,
            };
        },
    };
}

export const Hoc = defineComponent({
    name: 'Hoc',
    props: leafProps,
    setup(props) {
        const { getNode, onCompGetCtx, executeCtx } = inject(BASE_COMP_CONTEXT);
        const node = props.schema.id ? getNode(props.schema.id) : null;

        const { renderComp } = useLeaf(toRef(props, 'scope'), executeCtx);

        const { compProps, updateEvents, compSlots } = useSchema(props, node);

        // 控制显示
        const dialogControlProp = node.componentMeta.dialogControlProp;
        if (dialogControlProp)
            compProps[dialogControlProp] = node.isDialogOpen;

        const innerScope: ComputedRef<RuntimeScope> = computed(() => {
            if (props.schema.componentName === 'Slot') {
                const result: RuntimeScope = {
                    ...props.scope,
                };
                ensureArray(compProps.params).forEach((item, idx) => {
                    result[item as string] = (props.scope.__slot_args as any[])[idx];
                });
                return result;
            }
            return props.scope;
        });

        const { show, condition } = buildShow(innerScope, executeCtx, props.schema);

        const { loop, updateLoop, updateLoopArg, buildLoopScope } = useLoop(props, executeCtx);

        const innerBuildSlots = (
            slots: SlotSchemaMap,
            blockScope?: BlockScope | null,
        ) => {
            const result = buildSlots(renderComp, slots, blockScope);
            if (node?.isContainer())
                result.default = decorateDefaultSlot(result.default);

            return result;
        };

        // hoc
        if (node) {
            const disposeFunctions: Array<CallableFunction | undefined> = [];
            onUnmounted(() =>
                disposeFunctions.forEach(dispose => dispose?.()),
            );
            disposeFunctions.push(
                node.onChildrenChange(() => {
                    const schema = node.exportSchema(IPublicEnumTransformStage.Render);
                    compSlots.default = schema.children != null ? ensureArray(schema.children) : undefined;
                }),
            );
            disposeFunctions.push(
                node.onPropChange((info) => {
                    const { key, prop, newValue, oldValue } = info;

                    const isRootProp = prop.path.length === 1;
                    /** 根属性的 key 值 */
                    const rootPropKey: string = prop.path[0];

                    if (isRootProp && key) {
                        if (key === getConvertedExtraKey('events')) {
                            updateEvents(newValue, oldValue);
                        }
                        else if (key === getConvertedExtraKey('condition')) {
                            // 条件渲染更新 v-if
                            condition(newValue);
                        }
                        else if (key === getConvertedExtraKey('loop')) {
                            // 循环数据更新 v-for
                            updateLoop(newValue);
                        }
                        else if (key === getConvertedExtraKey('loopArgs')) {
                            // 循环参数初始化 (item, index)
                            updateLoopArg(newValue);
                        }
                        else if (key === getConvertedExtraKey('isDialogOpen')) {
                            // 控制显示
                            if (dialogControlProp)
                                compProps[dialogControlProp] = newValue;
                        }
                        else if (key === 'children') {
                            // 默认插槽更新
                            if (isJSSlot(newValue)) {
                                const slotNode: ISlotNode = prop.slotNode;
                                const schema = slotNode.exportSchema(
                                    IPublicEnumTransformStage.Render,
                                );
                                compSlots.default = schema;
                            }
                            else if (!isNil(newValue)) {
                                compSlots.default = ensureArray(newValue);
                            }
                            else {
                                delete compSlots.default;
                            }
                        }
                        else if (isJSSlot(newValue)) {
                            // 具名插槽更新
                            const slotNode: ISlotNode = prop.slotNode;
                            const schema = slotNode.exportSchema(
                                IPublicEnumTransformStage.Render,
                            );
                            compSlots[newValue?.name || key] = schema;
                        }
                        else if (isNil(newValue) && isJSSlot(oldValue)) {
                            // 具名插槽移除
                            delete compSlots[oldValue?.name || key];
                        }
                        else {
                            // 是否要忽略设置器的值？
                            if (dialogControlProp === rootPropKey)
                                return;

                            // 普通根属性更新
                            compProps[key] = newValue;
                        }
                    }
                    else if (rootPropKey === getConvertedExtraKey('loopArgs')) {
                        // 循环参数初始化 (item, index)
                        updateLoopArg(newValue, +key);
                    }
                    else if (rootPropKey) {
                        // 普通非根属性更新
                        compProps[rootPropKey] = node.getPropValue(rootPropKey);
                    }
                }),
            );
        }

        const getRef = (inst: IPublicTypeComponentInstance, blockScope?: BlockScope) => {
            const mergedScope = blockScope ? mergeScope(innerScope.value, blockScope) : innerScope.value;
            onCompGetCtx(props.schema, inst, mergedScope);
        };

        return {
            innerScope,
            show,
            loop,
            compSlots,
            compProps,
            getRef,
            buildLoopScope,
            innerBuildSlots,
            executeCtx,
            node,
            renderComp,
        };
    },
    render() {
        const {
            comp,
            show,
            loop,
            compProps,
            compSlots,
            getRef,
            buildLoopScope,
            innerBuildSlots,
            innerScope,
            executeCtx,
            node,
            renderComp,
        } = this;

        if (!show)
            return null;
        if (!comp)
            return h('div', 'component not found');

        if (!loop) {
            const props = buildProps({
                context: executeCtx,
                scope: innerScope,
                propsSchema: compProps,
                blockScope: null,
                extraProps: { ref: getRef },
                node,
                render: renderComp,
            });
            // slot 的 scope 是内建的，需要往后传
            const slots = innerBuildSlots(compSlots, node.componentName === 'Slot' ? innerScope : null);
            return h(comp, props, node.componentMeta.centerAction ? buildCenterAction(node, node.componentMeta.centerAction) : slots);
        }

        if (!Array.isArray(loop)) {
            console.warn('[vue-renderer]: loop must be array', loop);
            return null;
        }

        return h(
            Fragment,
            loop.map((item, index, arr) => {
                const blockScope = buildLoopScope(item, index, arr.length);
                const props = buildProps({
                    context: executeCtx,
                    scope: innerScope,
                    propsSchema: compProps,
                    blockScope,
                    extraProps: {
                        ref: (inst: IPublicTypeComponentInstance) => getRef(inst, blockScope),
                    },
                    node,
                    render: renderComp,
                });
                const slots = innerBuildSlots(compSlots, blockScope);
                return h(comp, props, slots);
            }),
        );
    },
});
