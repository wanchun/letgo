import { set } from 'lodash-es';
import { TransformStage } from '@webank/letgo-types';
import {
    ComponentPublicInstance,
    h,
    Fragment,
    reactive,
    onUnmounted,
    defineComponent,
} from 'vue';
import { useRendererContext } from '../context';
import { leafProps } from './base';
import { PropSchemaMap, SlotSchemaMap, useLeaf, genSlots } from './use';

export const Hoc = defineComponent({
    name: 'Hoc',
    props: leafProps,
    setup(props) {
        const { triggerCompGetCtx } = useRendererContext();
        const {
            node,
            buildSchema,
            buildProps,
            buildSlots,
            buildLoop,
            buildShow,
        } = useLeaf(props);

        const { show, condition } = buildShow(props.schema);
        const { loop, updateLoop, updateLoopArg, buildLoopScope } = buildLoop(
            props.schema,
        );

        const compProps: PropSchemaMap = reactive({});
        const compSlots: SlotSchemaMap = reactive({
            default: [],
        });
        const result = buildSchema();
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
                    Object.assign(compSlots, genSlots(schema.children));
                }),
            );
            disposeFunctions.push(
                node.onPropChange((info) => {
                    const { key, prop, newValue } = info;
                    if (key === '___condition___') {
                        // 条件渲染更新 v-if
                        condition(newValue);
                    } else if (key === '___loop___') {
                        // 循环数据更新 v-for
                        updateLoop(newValue);
                    } else if (key === '___loopArgs___') {
                        // 循环参数初始化 (item, index)
                        updateLoopArg(newValue);
                    } else if (prop.path[0] === '___loopArgs___') {
                        // 循环参数初始化 (item, index)
                        updateLoopArg(newValue, key);
                    } else if (prop.path) {
                        // 普通属性更新
                        set(compProps, prop.path, newValue);
                    }
                }),
            );
        }

        const getRef = (inst: ComponentPublicInstance) => {
            triggerCompGetCtx(props.schema, inst);
        };

        return {
            show,
            loop,
            compSlots,
            compProps,
            getRef,
            buildSlots,
            buildProps,
            buildLoopScope,
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
            buildSlots,
            buildProps,
            buildLoopScope,
        } = this;

        if (!show) return null;
        if (!comp) return h('div', 'component not found');

        if (!loop) {
            const props = buildProps(compProps, null, { ref: getRef });
            const slots = buildSlots(compSlots);
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
                const props = buildProps(compProps, blockScope, {
                    ref: getRef,
                });
                const slots = buildSlots(compSlots, blockScope);
                return h(comp, props, slots);
            }),
        );
    },
});
