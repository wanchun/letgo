import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { Area } from '../area';
import type { IPanelConfig } from '../types';
import type { Panel } from '../widget';
import { rightActiveDividerCls, rightAreaCls, rightDividerCls } from './workbench.css';

export default defineComponent({
    name: 'RightArea',
    props: {
        area: {
            type: Object as PropType<Area<IPanelConfig, Panel>>,
        },
    },
    setup(props) {
        const isActive = ref(false);
        const width = ref<number>(400);
        let clientX = 0;
        let lasWidth = width.value;
        const onMousedown = (event: MouseEvent) => {
            isActive.value = true;
            clientX = event.clientX;
            lasWidth = width.value;
        };
        const onMousemove = (event: MouseEvent) => {
            if (!isActive.value)
                return;

            width.value = lasWidth - (event.clientX - clientX);
        };
        const onMouseup = () => {
            if (!isActive.value)
                return;

            clientX = 0;
            isActive.value = false;
        };
        useEventListener(window.document, 'mousemove', onMousemove);
        useEventListener(window.document, 'mouseup', onMouseup);
        return () => {
            const { area } = props;

            return (
                <div
                    v-show={area.items.length}
                    class={rightAreaCls}
                    style={{
                        width: `${width.value}px`,
                    }}>
                    {area.items.map(item => item.content)}
                    <div
                        class={[rightDividerCls, isActive.value && rightActiveDividerCls]}
                        onMousedown={onMousedown}
                    ></div>
                </div>
            );
        };
    },
});
