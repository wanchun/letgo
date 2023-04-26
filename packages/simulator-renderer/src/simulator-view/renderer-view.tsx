import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import LowCodeRenderer from '@webank/letgo-renderer';
import type { ComponentInstance, NodeSchema } from '@webank/letgo-types';
import type { DocumentInstance, VueSimulatorRenderer } from '../interface';
import { BASE_COMP_CONTEXT } from '../constants';
import { Hoc } from '../built-in-components/hoc';

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
        provide(BASE_COMP_CONTEXT, {
            getNode: (id: string) => props.documentInstance.getNode(id),
            onCompGetCtx: (schema: NodeSchema, ref: ComponentInstance) => {
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
