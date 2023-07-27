import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IPanel } from '../types';
import { panelCls } from './panel.css';

export default defineComponent({
    name: 'Panel',
    props: {
        widget: {
            type: Object as PropType<IPanel>,
        },
    },
    setup(props) {
        return () => {
            const { widget } = props;

            return (
                <div
                    v-show={widget.visible}
                    class={panelCls}
                >
                    {widget.body}
                </div>
            );
        };
    },
});
