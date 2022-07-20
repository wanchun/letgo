import { defineComponent, PropType, VNode } from 'vue';
import { Area } from '../area';
import {
    IWidgetConfig,
    IPanelWidgetConfig,
    IDialogWidgetConfig,
} from '../types';

export default defineComponent({
    props: {
        area: {
            type: Object as PropType<
                Area<IWidgetConfig | IPanelWidgetConfig | IDialogWidgetConfig>
            >,
        },
    },
    setup(props) {
        const { area } = props;
        const top: VNode[] = [];
        const bottom: VNode[] = [];
        area.items.value
            .slice()
            .sort((a, b) => {
                const index1 = a.config?.index || 0;
                const index2 = b.config?.index || 0;
                return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
            })
            .forEach((item) => {
                const content = (
                    <div key={`left-area-${item.name}`}>{item.content}</div>
                );
                if (item.align === 'bottom') {
                    bottom.push(content);
                } else {
                    top.push(content);
                }
            });
        return () => {
            return (
                <div class={'letgo-left-area'}>
                    <div class="letgo-left-area-top">{top}</div>
                    <div class="letgo-left-area-bottom">{bottom}</div>
                </div>
            );
        };
    },
});
