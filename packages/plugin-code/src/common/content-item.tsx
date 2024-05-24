import type { PropType, StyleValue } from 'vue';
import { defineComponent } from 'vue';
import './content-item.less';

export default defineComponent({
    props: {
        label: String,
        labelStyle: String as PropType<StyleValue>,
    },
    setup(props, { slots }) {
        const renderLabel = () => {
            return (
                <label class="letgo-plg-code__content-label" style={props.labelStyle}>
                    {slots.label?.() || props.label}
                </label>
            );
        };
        return () => {
            return (
                <div class="letgo-plg-code__content-item">
                    {renderLabel()}
                    {slots.content?.() ?? slots.default?.()}
                </div>
            );
        };
    },
});
