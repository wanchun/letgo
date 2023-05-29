import { computed, defineComponent, h, provide, watch } from 'vue';
import type { PropType } from 'vue';
import LowCodeRenderer from '@webank/letgo-renderer';
import type { CodeItem, IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { DocumentInstance, VueSimulatorRenderer } from '../interface';
import { BASE_COMP_CONTEXT } from '../constants';
import { Hoc } from '../built-in-components/hoc';
import { useCodesInstance } from '../code-impl/code-impl';
import { useContext } from '../context/context';
import { host } from '../host';

export default defineComponent({
    name: 'RendererView',
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
        } = useCodesInstance(code.value.codeMap);

        const { executeCtx } = useContext(codesInstance, props.documentInstance.vueInstanceMap);

        initCodesInstance(executeCtx);

        code.value.onCodeItemAdd((item: CodeItem) => createCodeInstance(item, executeCtx));
        code.value.onCodeItemDelete(deleteCodeInstance);
        code.value.onCodeItemChanged(changeCodeInstance);
        code.value.onCodeIdChanged(changeCodeInstanceId);

        watch(codesInstance, () => {
            host.updateCodesInstance(codesInstance);
        }, {
            deep: true,
        });

        provide(BASE_COMP_CONTEXT, {
            getNode: (id: string) => props.documentInstance.getNode(id),
            executeCtx,
            onCompGetCtx: (schema: IPublicTypeNodeSchema, ref: IPublicTypeComponentInstance) => {
                if (ref)
                    props.documentInstance.mountInstance(schema.id!, ref);
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

        return h(LowCodeRenderer, {
            schema,
            components,
            device,
        });
    },
});
