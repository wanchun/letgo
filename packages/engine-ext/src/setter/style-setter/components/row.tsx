import { defineComponent } from 'vue';
import { wrapperCls, labelCls, contentCls } from './row.css';

export default defineComponent({
    props: {
        label: String,
    },
    setup(props, { slots }) {
        return () => {
            return (
                <div class={wrapperCls}>
                    <div class={labelCls}>{props.label}</div>
                    <div class={contentCls}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});
