import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { IPanelConfig } from '../types';
import { Panel } from '../widget';

export default defineComponent({
    props: {
        area: {
            type: Object as PropType<Area<IPanelConfig, Panel>>,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            return (
                <div v-show={area.items.value.length} class="letgo-right-area">
                    {area.items.value.map((item) => item.content)}
                </div>
            );
        };
    },
});
