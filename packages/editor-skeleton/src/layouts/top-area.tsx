import { defineComponent, PropType, VNode, watch } from 'vue';
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
        console.log(props.area);

        return () => {
            const { area } = props;
            const left: VNode[] = [];
            const center: VNode[] = [];
            const right: VNode[] = [];
            area.items.value
                .slice()
                .sort((a, b) => {
                    const index1 = a.config?.index || 0;
                    const index2 = b.config?.index || 0;
                    return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
                })
                .forEach((item) => {
                    const content = (
                        <div key={`top-area-${item.name}`}>{item.content}</div>
                    );
                    if (item.align === 'center') {
                        center.push(content);
                    } else if (item.align === 'left') {
                        left.push(content);
                    } else {
                        right.push(content);
                    }
                });
            return (
                <div class="letgo-top-area">
                    <div class="letgo-top-area-left">{left}</div>
                    <div class="letgo-top-area-center">{center}</div>
                    <div class="letgo-top-area-right">{right}</div>
                </div>
            );
        };
    },
});
