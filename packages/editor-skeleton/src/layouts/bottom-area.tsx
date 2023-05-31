import type { PropType, VNodeChild } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type {
    IWidgetConfig,
} from '../types';
import type { Widget } from '../widget';
import {
    bottomAreaCenterCls,
    bottomAreaCls,
    bottomAreaLeftCls,
    bottomAreaRightCls,
} from './workbench.css';

export default defineComponent({
    name: 'BottomArea',
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
                <div class={bottomAreaCls}>
                    <div class={bottomAreaLeftCls}>{left}</div>
                    <div class={bottomAreaCenterCls}>{center}</div>
                    <div class={bottomAreaRightCls}>{right}</div>
                </div>
            );
        };
    },
});
