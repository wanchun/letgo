import type { PropType, VNodeChild } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type {
    IWidgetConfig,
} from '../types';
import type { Widget } from '../widget';

export default defineComponent({
    name: 'Toolbar',
    props: {
        area: {
            type: Object as PropType<
                Area<
                    IWidgetConfig,
                    Widget
                >
            >,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            const left: VNodeChild[] = [];
            const center: VNodeChild[] = [];
            const right: VNodeChild[] = [];
            const itemsValue = area.items;
            if (!itemsValue.length)
                return null;

            itemsValue
                .slice()
                .sort((a, b) => {
                    const index1 = a.config?.index || 0;
                    const index2 = b.config?.index || 0;
                    return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
                })
                .forEach((item) => {
                    const content = item.content;
                    if (item.align === 'center')
                        center.push(content);

                    else if (item.align === 'left')
                        left.push(content);

                    else
                        right.push(content);
                });
            return (
                <div class="letgo-skeleton-workbench__toolbar">
                    <div class="letgo-skeleton-workbench__horizontal">{left}</div>
                    <div class="letgo-skeleton-workbench__horizontal letgo-skeleton-workbench__horizontal--center">{center}</div>
                    <div class="letgo-skeleton-workbench__horizontal">{right}</div>
                </div>
            );
        };
    },
});
