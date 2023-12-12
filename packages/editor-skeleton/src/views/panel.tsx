import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IPanel } from '../types';
import './panel.less';

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
                <div class="letgo-skeleton__panel">
                    {widget.body}
                </div>
            );
        };
    },
});
