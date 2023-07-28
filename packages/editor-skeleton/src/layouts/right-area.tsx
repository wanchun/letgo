import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import { editor } from '@harrywan/letgo-editor-core';
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
        const isHover = ref(false);
        const width = ref<number>(400);
        let clientX = 0;
        let lasWidth = width.value;
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
            clientX = event.clientX;
            lasWidth = width.value;
            editor.set('isSkeletonDragging', true);
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
            editor.set('isSkeletonDragging', false);
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
                        class={[rightDividerCls, (isHover.value || isActive.value) && rightActiveDividerCls]}
                        onMouseenter={onMouseenter}
                        onMouseleave={onMouseleave}
                        onMousedown={onMousedown}
                    ></div>
                </div>
            );
        };
    },
});
