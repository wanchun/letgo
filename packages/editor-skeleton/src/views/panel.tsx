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
        const { widget } = props;

        return () => {
            if (!widget.visible)
                return;

            return (
                <div class={panelCls}>
                    {widget.body}
                </div>
            );
        };
    },
});
