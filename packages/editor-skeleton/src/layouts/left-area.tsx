import type { PropType, VNodeChild } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type {
    IWidgetConfig,
} from '../types';
import type { Widget } from '../widget';
import {
    leftAreaBottomCls,
    leftAreaCls,
    leftAreaTopCls,
} from './workbench.css';

export default defineComponent({
    name: 'LeftArea',
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
        const { area } = props;
        const top: VNodeChild[] = [];
        const bottom: VNodeChild[] = [];
        area.items
            .slice()
            .sort((a, b) => {
                const index1 = a.config?.index || 0;
                const index2 = b.config?.index || 0;
                return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
            })
            .forEach((item) => {
                const content = item.content;
                if (item.align === 'bottom')
                    bottom.push(content);

                else
                    top.push(content);
            });
        return () => {
            return (
                <div class={leftAreaCls}>
                    <div class={leftAreaTopCls}>{top}</div>
                    <div class={leftAreaBottomCls}>{bottom}</div>
                </div>
            );
        };
    },
});
