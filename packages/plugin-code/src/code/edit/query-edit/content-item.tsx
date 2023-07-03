import type { PropType, StyleValue } from 'vue';
import { defineComponent } from 'vue';
import { contentItemCls, labelCls } from './content-item.css';

export default defineComponent({
    props: {
        label: String,
        labelStyle: String as PropType<StyleValue>,
    },
    setup(props, { slots }) {
        const renderLabel = () => {
            return <label class={labelCls} style={props.labelStyle}>
                {slots.label?.() || props.label}
            </label>;
        };
        return () => {
            return <div class={contentItemCls} >
                {renderLabel()}
                {slots.content?.()}
            </div>;
        };
    },
});
