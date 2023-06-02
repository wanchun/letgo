import { defineComponent } from 'vue';
import { labelTextCls, labelWrapCls } from './label.css';

export default defineComponent({
    props: {
        label: String,
    },
    setup(props, { slots }) {
        return () => {
            return <div class={labelWrapCls}>
                <label class={labelTextCls}>{props.label}</label>
                {slots.default?.()}
            </div>;
        };
    },
});
