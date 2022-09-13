import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { IWidgetConfig, IPanelConfig } from '../types';
import { Widget, Panel } from '../widget';

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
                <div class={'letgo-main-area'}>
                    {area.items.value.map((item) => item.content)}
                </div>
            );
        };
    },
});
