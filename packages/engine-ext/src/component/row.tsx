import { defineComponent } from 'vue';
import { contentCls, labelCls, wrapperCls } from './row.css';

export default defineComponent({
    props: {
        label: String,
        labelWidth: {
            type: Number,
            default: 60,
        },
    },
    setup(props, { slots }) {
        return () => {
            return (
                <div class={wrapperCls}>
                    <div class={labelCls} style={{ width: `${props.labelWidth}px` }}>{props.label}</div>
                    <div class={contentCls}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});
