import type { PropType, VNodeChild } from 'vue';
import { defineComponent, ref, watch } from 'vue';
import { addUnit } from '@webank/letgo-common';
import { useEventListener } from '@vueuse/core';
import { editor } from '@webank/letgo-editor-core';
import type { Area } from '../area';
import type {
    ITabPanelConfig,
} from '../types';
import type { TabPanel } from '../widget';

export default defineComponent({
    name: 'BottomArea',
    props: {
        area: {
            type: Object as PropType< Area< ITabPanelConfig, TabPanel > >,
        },
    },
    setup(props) {
        const isActive = ref(false);
        const isHover = ref(false);
        const height = ref<number>(30);
        let clientY = 0;
        let lastHeight = height.value;
        let timer: number;
        const onMouseenter = () => {
            timer = setTimeout(() => {
                isHover.value = true;
            }, 300) as unknown as number;
        };
        const onMouseleave = () => {
            isHover.value = false;
            if (timer)
                clearTimeout(timer);
        };
        const onMousedown = (event: MouseEvent) => {
            isActive.value = true;
            clientY = event.clientY;
            lastHeight = height.value;
            editor.set('isSkeletonDragging', true);
        };
        const onMousemove = (event: MouseEvent) => {
            if (!isActive.value)
                return;
            height.value = lastHeight - (event.clientY - clientY);
        };
        const onMouseup = () => {
            if (!isActive.value)
                return;

            clientY = 0;
            isActive.value = false;
            editor.set('isSkeletonDragging', false);
        };
        useEventListener(window.document, 'mousemove', onMousemove);
        useEventListener(window.document, 'mouseup', onMouseup);

        watch(() => props.area.current, (c) => {
            if (c) {
                if (c?.config.props.height)
                    height.value = c.config.props.height;
            }
            else {
                height.value = 30;
            }
        }, {
            immediate: true,
        });

        return () => {
            const { area } = props;
            const left: VNodeChild[] = [];
            const center: VNodeChild[] = [];
            const right: VNodeChild[] = [];
            const { current } = area;
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
                    const label = item.label;
                    if (item.align === 'center')
                        center.push(label);

                    else if (item.align === 'left')
                        left.push(label);

                    else
                        right.push(label);
                });
            return (
                <div
                    class="letgo-skeleton-workbench__bottom"
                    style={{
                        height: `${height.value}px`,
                    }}
                >
                    <div
                        class={['letgo-skeleton-workbench__bottom-divider', (isHover.value || isActive.value) && 'letgo-skeleton-workbench__bottom-divider--active']}
                        onMouseenter={onMouseenter}
                        onMouseleave={onMouseleave}
                        onMousedown={onMousedown}
                    >
                    </div>
                    <div class="letgo-skeleton-workbench__bottom-header">
                        <div class="letgo-skeleton-workbench__horizontal">{left}</div>
                        <div class="letgo-skeleton-workbench__horizontal letgo-skeleton-workbench__horizontal--center">{center}</div>
                        <div class="letgo-skeleton-workbench__horizontal">{right}</div>
                    </div>
                    <div class="letgo-skeleton-workbench__bottom-body" style={{ height: addUnit(current?.config.props.height) }}>
                        { current?.body }
                    </div>
                </div>
            );
        };
    },
});
