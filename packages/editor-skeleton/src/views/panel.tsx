import { defineComponent, PropType } from 'vue';
import { IWidget } from '../types';
import './panel.less';

export default defineComponent({
    props: {
        widget: {
            type: Object as PropType<IWidget>,
        },
    },
    setup(props) {
        return () => {
            const { widget } = props;
            if (!widget.visible.value) {
                return null;
            }
            return <div class="letgo-panel">{widget.body}</div>;
        };
    },
});
