import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { isNil } from 'lodash-es';
import type { IWidget } from '../types';
import { panelCls } from './panel.css';

export default defineComponent({
    name: 'Panel',
    props: {
        widget: {
            type: Object as PropType<IWidget>,
        },
        width: Number,
        height: Number,
        maxWidth: Number,
        maxHeight: Number,
    },
    setup(props) {
        return () => {
            const { widget, width, height, maxWidth, maxHeight } = props;
            const style = [];
            if (!isNil(width))
                style.push({ width: `${width}px` });

            if (!isNil(height))
                style.push({ height: `${height}px` });

            if (!isNil(maxWidth))
                style.push({ maxWidth: `${maxWidth}px` });

            if (!isNil(maxHeight))
                style.push({ maxHeight: `${maxHeight}px` });

            return (
                <div
                    v-show={widget.visible.value}
                    class={panelCls}
                    style={style}
                >
                    {widget.body}
                </div>
            );
        };
    },
});
