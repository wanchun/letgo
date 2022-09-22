import { defineComponent, PropType } from 'vue';
import { Simulator } from '../simulator';

export const BemToolsView = defineComponent({
    name: 'BemToolsView',
    props: {
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    render() {
        return <div class="letgo-bem-tools"></div>;
    },
});
