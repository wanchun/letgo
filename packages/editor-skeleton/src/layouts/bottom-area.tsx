import { defineComponent, PropType, VNode } from 'vue';
import { Area } from '../area';
import {
    IWidgetConfig,
    IWidgetPanelConfig,
    IWidgetModalConfig,
} from '../types';
import { Widget, WidgetModal, WidgetPanel } from '../widget';

export default defineComponent({
    props: {
        area: {
            type: Object as PropType<
                Area<
                    IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig,
                    Widget | WidgetModal | WidgetPanel
                >
            >,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            const left: VNode[] = [];
            const center: VNode[] = [];
            const right: VNode[] = [];
            const itemsValue = area.items.value;
            if (!itemsValue.length) {
                return null;
            }

            itemsValue
                .slice()
                .sort((a, b) => {
                    const index1 = a.config?.index || 0;
                    const index2 = b.config?.index || 0;
                    return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
                })
                .forEach((item) => {
                    const content = (
                        <div key={`bottom-area-${item.name}`}>
                            {item.content}
                        </div>
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
                <div class="letgo-bottom-area">
                    <div class="letgo-bottom-area-left">{left}</div>
                    <div class="letgo-bottom-area-center">{center}</div>
                    <div class="letgo-bottom-area-right">{right}</div>
                </div>
            );
        };
    },
});
