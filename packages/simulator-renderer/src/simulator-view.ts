import { defineComponent, provide, h, PropType, DefineComponent } from 'vue';
import LowCodeRenderer from '@webank/letgo-renderer';
import { RouterView } from 'vue-router';
import { DocumentInstance, VueSimulatorRenderer } from './interface';
import { BASE_COMP_CONTEXT } from './constants';
import { Hoc } from './buildin-components/hoc';
import type { NodeSchema, ComponentInstance } from '@webank/letgo-types';

export const Layout = defineComponent({
    props: {
        simulator: {
            type: Object as PropType<VueSimulatorRenderer>,
            required: true,
        },
    },
    render() {
        const { simulator, $slots } = this;
        const { layout, getComponent } = simulator;
        if (layout) {
            const { Component, props = {}, componentName } = layout;
            if (Component) {
                return h(
                    Component,
                    { ...props, key: 'layout', simulator } as any,
                    $slots,
                );
            }
            const ComputedComponent =
                componentName && getComponent(componentName);
            if (ComputedComponent) {
                return h(
                    ComputedComponent as DefineComponent,
                    { ...props, key: 'layout', simulator },
                    $slots,
                );
            }
        }
        return $slots.default?.();
    },
});

export const SimulatorRendererView = defineComponent({
    props: {
        simulator: {
            type: Object as PropType<VueSimulatorRenderer>,
            required: true,
        },
    },
    render() {
        const { simulator } = this;
        return h(Layout, { simulator }, { default: () => h(RouterView) });
    },
});

export const Renderer = defineComponent({
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
                if (ref) {
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

        console.log('render-schema:', schema);

        if (!simulator.autoRender) return null;

        return h(LowCodeRenderer, {
            schema: schema,
            components: components,
            device: device,
        });
    },
});
