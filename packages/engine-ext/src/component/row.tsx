import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        label: String,
        labelWidth: {
            type: Number,
            default: 60,
        },
        labelAlign: String as PropType<'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent'>,
        margin: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { slots }) {
        return () => {
            return (
                <div class="letgo-ext-row" style={[!props.margin && { margin: 0 }]}>
                    <div class="letgo-ext-row__label" style={[{ width: `${props.labelWidth}px`, textAlign: props.labelAlign }]}>{props.label}</div>
                    <div class="letgo-ext-row__content">{slots.default?.()}</div>
                </div>
            );
        };
    },
});
