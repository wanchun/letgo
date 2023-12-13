import { computed, defineComponent, h, onUnmounted, provide, watch } from 'vue';
import type { PropType } from 'vue';
import { Renderer } from '@webank/letgo-renderer';
import { type CodeItem, CodeType, type IPublicTypeComponentInstance, type IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { DocumentInstance, VueSimulatorRenderer } from '../interface';
import { BASE_COMP_CONTEXT } from '../constants';
import type { JavascriptFunctionImpl } from '../code-impl/javascript-function';
import { useCodesInstance } from '../code-impl/code-impl';
import { useContext } from '../context/context';
import { host } from '../host';
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

        const { executeCtx } = useContext(codesInstance);

        initCodesInstance(code.value.codeMap, executeCtx);

        const offCodeChangedEvent: (() => void)[] = [];
        offCodeChangedEvent.push(
            code.value.onCodesChanged((currentCodeMap: Map<string, CodeItem>) => {
                initCodesInstance(currentCodeMap, executeCtx);
            }),
            code.value.onCodeItemAdd((item: CodeItem) => {
                createCodeInstance(item, executeCtx);
                if (codesInstance[item.id].type === CodeType.JAVASCRIPT_FUNCTION)
                    executeCtx[item.id] = (codesInstance[item.id] as JavascriptFunctionImpl).trigger.bind(codesInstance[item.id]);

                else executeCtx[item.id] = codesInstance[item.id];
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
            executeCtx[ref] = executeCtx[preRef];
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
            onCompGetCtx: (schema: IPublicTypeNodeSchema, ref: IPublicTypeComponentInstance) => {
                if (ref) {
                    if (schema.ref)
                        executeCtx[schema.ref] = ref;
                    onUnmounted(() => {
                        delete executeCtx[schema.ref];
                    }, ref.$);

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
