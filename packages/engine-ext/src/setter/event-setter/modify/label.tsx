import { defineComponent } from 'vue';
import { labelCls } from '../../../component/row.css';
import { labelWrapCls } from './label.css';

export default defineComponent({
    props: {
        label: String,
    },
    setup(props) {
        return () => {
            return <div class={labelWrapCls}>
                <label class={labelCls}>{props.label}</label>
                <slot></slot>
            </div>;
        };
    },
});
