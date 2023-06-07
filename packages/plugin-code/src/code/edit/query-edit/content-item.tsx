import { defineComponent } from 'vue';
import { contentItemCls, labelCls } from './content-item.css';

export default defineComponent({
    props: {
        label: String,
    },
    setup(props, { slots }) {
        const renderLabel = () => {
            return <label class={labelCls}>
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
