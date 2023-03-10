import { isNil } from 'lodash-es';
import {
    h,
    Fragment,
    inject,
    reactive,
    Slot,
    onUnmounted,
    defineComponent,
} from 'vue';
import {
    ensureArray,
    BlockScope,
    leafProps,
    useLeaf,
    buildSchema,
    buildProps,
    buildLoop,
    buildShow,
    buildSlots,
} from '@webank/letgo-renderer';
import {
    TransformStage,
    ComponentInstance,
    isJSSlot,
} from '@webank/letgo-types';
import { BASE_COMP_CONTEXT } from '../constants';
import type { SlotNode } from '@webank/letgo-designer';
import type { SlotSchemaMap } from '@webank/letgo-renderer';

/**
 * 装饰默认插槽，当插槽为空时，渲染插槽占位符，便于拖拽
 *
 * @param slot - 插槽渲染函数
 */
const decorateDefaultSlot = (slot: Slot): Slot => {
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
};

export const Hoc = defineComponent({
    name: 'Hoc',
    props: leafProps,
    setup(props) {
        const { getNode, onCompGetCtx } = inject(BASE_COMP_CONTEXT);
        const node = props.schema.id ? getNode(props.schema.id) : null;

        const { renderComp } = useLeaf(props);

        const { show, condition } = buildShow(props.scope, props.schema);
        const { loop, updateLoop, updateLoopArg, buildLoopScope } = buildLoop(
            props.scope,
            props.schema,
        );

        const innerBuildSlots = (
            slots: SlotSchemaMap,
            blockScope?: BlockScope | null,
        ) => {
            const result = buildSlots(renderComp, slots, blockScope) as Record<
                string,
                Slot
            >;
            if (node?.isContainer()) {
                result.default = decorateDefaultSlot(result.default);
            }
            return result;
        };

        const compProps: {
            [x: string]: unknown;
        } = reactive({});
        const compSlots: SlotSchemaMap = reactive({});

        const result = buildSchema(props);

        Object.entries(props.schema.props ?? {}).forEach(([key, val]) => {
            if (isJSSlot(val)) {
                // 处理具名插槽
                const prop = node?.getProp(key);
                if (prop && prop.slotNode) {
                    // design 模式，从 prop 对象到处 schema
                    const slotSchema = prop.slotNode.export(
                        TransformStage.Render,
                    );
                    result.slots[key] = slotSchema;
                }
            }
        });

        Object.assign(compProps, result.props);
        Object.assign(compSlots, result.slots);

        // hoc
        if (node) {
            const disposeFunctions: Array<CallableFunction | undefined> = [];
            onUnmounted(() =>
                disposeFunctions.forEach((dispose) => dispose?.()),
            );
            disposeFunctions.push(
                node.onChildrenChange(() => {
                    const schema = node.export(TransformStage.Render);
                    compSlots.default = ensureArray(schema.children);
                }),
            );
            disposeFunctions.push(
                node.onPropChange((info) => {
                    const { key, prop, newValue, oldValue } = info;

                    const isRootProp = prop.path.length === 1;
                    /** 根属性的 key 值 */
                    const rootPropKey: string = prop.path[0];

                    if (isRootProp && key) {
                        if (key === '___condition___') {
                            // 条件渲染更新 v-if
                            condition(newValue);
                        } else if (key === '___loop___') {
                            // 循环数据更新 v-for
                            updateLoop(newValue);
                        } else if (key === '___loopArgs___') {
                            // 循环参数初始化 (item, index)
                            updateLoopArg(newValue);
                        } else if (key === 'children') {
                            // 默认插槽更新
                            if (isJSSlot(newValue)) {
                                const slotNode: SlotNode = prop.slotNode;
                                const schema = slotNode.export(
                                    TransformStage.Render,
                                );
                                compSlots.default = schema;
                            }
                            if (!isNil(newValue)) {
                                compSlots.default = ensureArray(newValue);
                            } else {
                                delete compSlots.default;
                            }
                        } else if (isJSSlot(newValue)) {
                            // 具名插槽更新
                            const slotNode: SlotNode = prop.slotNode;
                            const schema = slotNode.export(
                                TransformStage.Render,
                            );
                            compSlots[key] = schema;
                        } else if (isNil(newValue) && isJSSlot(oldValue)) {
                            // 具名插槽移除
                            delete compSlots[key];
                        } else {
                            // 普通根属性更新
                            compProps[key] = newValue;
                        }
                    } else if (rootPropKey === '___loopArgs___') {
                        // 循环参数初始化 (item, index)
                        updateLoopArg(newValue, key);
                    } else if (rootPropKey) {
                        // 普通非根属性更新
                        compProps[rootPropKey] = node.getPropValue(rootPropKey);
                    }
                }),
            );
        }

        const getRef = (inst: ComponentInstance) => {
            onCompGetCtx(props.schema, inst);
        };

        return {
            show,
            loop,
            compSlots,
            compProps,
            getRef,
            buildLoopScope,
            innerBuildSlots,
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
            scope,
        } = this;

        if (!show) return null;
        if (!comp) return h('div', 'component not found');

        if (!loop) {
            const props = buildProps(scope, compProps, null, { ref: getRef });
            const slots = innerBuildSlots(compSlots);
            return h(comp, props, slots);
        }

        if (!Array.isArray(loop)) {
            console.warn('[vue-renderer]: loop must be array', loop);
            return null;
        }

        return h(
            Fragment,
            loop.map((item, index, arr) => {
                const blockScope = buildLoopScope(item, index, arr.length);
                const props = buildProps(scope, compProps, blockScope, {
                    ref: getRef,
                });
                const slots = innerBuildSlots(compSlots, blockScope);
                return h(comp, props, slots);
            }),
        );
    },
});
