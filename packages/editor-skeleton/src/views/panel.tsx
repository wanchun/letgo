import { defineComponent, PropType } from 'vue';
import { IWidget } from '../types';
import './panel.less';

export default defineComponent({
    name: 'Panel',
    props: {
        widget: {
            type: Object as PropType<IWidget>,
        },
    },
    setup(props) {
        return () => {
            const { widget } = props;
            return (
                <div v-show={widget.visible.value} class="letgo-panel">
                    {widget.body}
                </div>
            );
        };
    },
});
