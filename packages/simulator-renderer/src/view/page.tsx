import { computed, defineComponent, h, nextTick, onUnmounted, provide, watch } from 'vue';
import type { PropType } from 'vue';
import type { RuntimeScope } from '@webank/letgo-renderer';
import { Renderer } from '@webank/letgo-renderer';
import type {
    ICodeItem,
    IPublicTypeComponentInstance,
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import type { DocumentInstance, VueSimulatorRenderer } from '../interface';
import { BASE_COMP_CONTEXT } from '../constants';
import { useCodesInstance } from '../code-impl/code-impl';
import { useContext } from '../context/context';
import { host } from '../host';
import { getVueInstance } from '../utils';
import { Hoc } from './hoc';

export default defineComponent({
    name: 'SimulatorPage',
    props: {
        simulator: {
            type: Object as PropType<VueSimulatorRenderer>,
            required: true,
        },
        documentInstance: {
            type: Object as PropType<DocumentInstance>,
            required: true,
        },
    },
    setup(props) {
        const code = computed(() => {
            return props.documentInstance.document.code;
        });

        const {
            codesInstance,
            initCodesInstance,
            createCodeInstance,
            deleteCodeInstance,
            changeCodeInstance,
            changeCodeInstanceId,
        } = useCodesInstance();

        const { executeCtx, compInstances } = useContext(codesInstance, props.documentInstance);

        watch(() => props.documentInstance.defaultProps, (val) => {
            executeCtx.props = val || {};
        }, {
            immediate: true,
        });
        initCodesInstance(code.value.codeMap, executeCtx);

        const offCodeChangedEvent: (() => void)[] = [];
        offCodeChangedEvent.push(
            code.value.onCodesChanged((currentCodeMap: Map<string, ICodeItem>) => {
                initCodesInstance(currentCodeMap, executeCtx);
            }),
            code.value.onCodeItemAdd((item: ICodeItem) => {
                createCodeInstance(item, executeCtx);
            }),
            code.value.onCodeItemDelete((id: string) => {
                // TODO 有依赖的时候删除给提示
                deleteCodeInstance(id);
                delete executeCtx[id];
            }),
            code.value.onCodeItemChanged((id: string, content: Record<string, any>) => {
                changeCodeInstance(id, content, executeCtx);
            }),
            code.value.onCodeIdChanged((id: string, preId: string) => {
                changeCodeInstanceId(id, preId);
                executeCtx[id] = executeCtx[preId];
                delete executeCtx[preId];
            }),
        );

        const offNodeRefChange = props.documentInstance.document.onNodeRefChange((ref: string, preRef: string) => {
            compInstances[ref] = compInstances[preRef];
            delete compInstances[preRef];
            delete executeCtx[preRef];
        });

        onUnmounted(() => {
            offNodeRefChange();
            offCodeChangedEvent.forEach(fn => fn());
        });

        const viewState = computed(() => {
            return Object.keys(codesInstance).reduce((acc, cur) => {
                acc[cur] = codesInstance[cur].view;
                return acc;
            }, {} as { [key: string]: any });
        });
        watch(viewState, () => {
            host.updateCodesInstance(codesInstance);
        }, {
            immediate: true,
            deep: true,
        });

        provide(BASE_COMP_CONTEXT, {
            getNode: (id: string) => props.documentInstance.getNode(id),
            executeCtx,
            onCompGetCtx: (schema: IPublicTypeNodeSchema, ref: IPublicTypeComponentInstance, scope?: RuntimeScope) => {
                if (ref) {
                    if (schema.ref) {
                        (ref as any).__scope = scope;
                        nextTick(() => {
                            // 如果 schema 是个 loop, ref 和组件实例不是一对一关系，因此不能直接用 ref 参数，
                            compInstances[schema.ref] = props.documentInstance.document.state.componentsInstance[schema.ref];
                        });
                    }
                    const instance = getVueInstance(ref);
                    if (instance) {
                        onUnmounted(() => {
                            if (!Array.isArray(compInstances[schema.ref])) {
                                compInstances[schema.ref] = {};
                            }
                            else {
                                const index = compInstances[schema.ref].findIndex((item: IPublicTypeComponentInstance) => item === ref);
                                compInstances[schema.ref].splice(index, 1);
                            }
                        }, instance.$);
                    }

                    props.documentInstance.mountInstance(schema.id!, ref);
                }
            },
        });
    },
    render() {
        const { documentInstance, simulator } = this;
        const { schema } = documentInstance;
        const { device, components } = simulator;
        components.__BASE_COMP = Hoc;

        if (!simulator.autoRender)
            return null;

        return h(Renderer, {
            schema,
            components,
            device,
        });
    },
});
