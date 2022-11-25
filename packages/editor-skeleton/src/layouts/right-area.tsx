import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { IPanelConfig } from '../types';
import { Panel } from '../widget';
import { rightAreaCls } from './workbench.css';

export default defineComponent({
    name: 'RightArea',
    props: {
        area: {
            type: Object as PropType<Area<IPanelConfig, Panel>>,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            return (
                <div v-show={area.items.value.length} class={rightAreaCls}>
                    {area.items.value.map((item) => item.content)}
                </div>
            );
        };
    },
});
