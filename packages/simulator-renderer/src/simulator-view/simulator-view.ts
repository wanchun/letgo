import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { RouterView } from 'vue-router';
import type { VueSimulatorRenderer } from '../interface';
import LayoutView from './layout-view';

export default defineComponent({
    name: 'SimulatorRendererView',
    props: {
        simulator: {
            type: Object as PropType<VueSimulatorRenderer>,
            required: true,
        },
    },
    render() {
        const { simulator } = this;
        return h(LayoutView, { simulator }, { default: () => h(RouterView) });
    },
});
