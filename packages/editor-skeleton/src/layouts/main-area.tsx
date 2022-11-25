import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { IWidgetConfig, IPanelConfig } from '../types';
import { Widget, Panel } from '../widget';
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
                    {area.items.value.map((item) => item.content)}
                </div>
            );
        };
    },
});
