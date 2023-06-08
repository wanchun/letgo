import { defineComponent } from 'vue';
import { separatorCls } from './separator.css';

export default defineComponent({
    name: 'Separator',
    props: {
        text: String,
    },
    setup(props) {
        return () => {
            return <div class={separatorCls}>{props.text}</div>;
        };
    },
});