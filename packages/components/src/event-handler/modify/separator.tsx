import { defineComponent } from 'vue';
import './separator.less';

export default defineComponent({
    name: 'Separator',
    props: {
        text: String,
    },
    setup(props) {
        return () => {
            return <div class="letgo-comp-event__separator">{props.text}</div>;
        };
    },
});
