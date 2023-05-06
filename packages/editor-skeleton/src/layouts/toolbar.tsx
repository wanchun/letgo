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
                    const content = (
                        <div key={`toolbar-${item.name}`}>{item.content}</div>
                    );
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
