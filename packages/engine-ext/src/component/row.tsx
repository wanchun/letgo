import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { contentCls, labelCls, wrapperCls } from './row.css';

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
                <div class={wrapperCls} style={[!props.margin && { margin: 0 }]}>
                    <div class={labelCls} style={[{ width: `${props.labelWidth}px`, textAlign: props.labelAlign }]}>{props.label}</div>
                    <div class={contentCls}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});
