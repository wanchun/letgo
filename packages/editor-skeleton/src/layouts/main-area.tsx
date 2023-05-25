import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type { IPanelConfig, IWidgetConfig } from '../types';
import type { Panel, Widget } from '../widget';
import { mainAreaCls } from './workbench.css';

export default defineComponent({
    name: 'MainArea',
    props: {
        area: {
            type: Object as PropType<
                Area<IWidgetConfig | IPanelConfig, Widget | Panel>
            >,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            return (
                <div class={mainAreaCls}>
                    {area.items.map(item => item.content)}
                </div>
            );
        };
    },
});
