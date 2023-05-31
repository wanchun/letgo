import type { PropType, VNodeChild } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type {
    IWidgetConfig,
} from '../types';
import type { Widget } from '../widget';
import {
    toolbarCenterCls,
    toolbarCls,
    toolbarLeftCls,
    toolbarRightCls,
} from './workbench.css';

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
                <div class={toolbarCls}>
                    <div class={toolbarLeftCls}>{left}</div>
                    <div class={toolbarCenterCls}>{center}</div>
                    <div class={toolbarRightCls}>{right}</div>
                </div>
            );
        };
    },
});
