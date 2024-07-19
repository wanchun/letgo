import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type { IModalConfig } from '../types';
import type { Modal } from '../widget';

export default defineComponent({
    name: 'GlobalArea',
    props: {
        area: {
            type: Object as PropType<Area<IModalConfig, Modal>>,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            return <div class="letgo-skeleton-workbench__global">{area.items.map(item => item.content)}</div>;
        };
    },
});
