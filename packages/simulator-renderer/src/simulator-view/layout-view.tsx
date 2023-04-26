import { defineComponent, h } from 'vue';
import type { DefineComponent, PropType } from 'vue';
import type { VueSimulatorRenderer } from '../interface';

export default defineComponent({
    name: 'LayoutView',
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
            const ComputedComponent
                = componentName && getComponent(componentName);
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
