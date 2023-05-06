import type { PropType, VNode } from 'vue';
import { defineComponent } from 'vue';
import type { Area } from '../area';
import type {
    IWidgetConfig,
    IWidgetModalConfig,
    IWidgetPanelConfig,
} from '../types';
import type { Widget, WidgetModal, WidgetPanel } from '../widget';
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
                    IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig,
                    Widget | WidgetModal | WidgetPanel
                >
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
