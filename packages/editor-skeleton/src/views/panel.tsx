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
        displayDirective: {
            type: String as PropType<'if' | 'show'>,
            default: 'if',
        },
    },
    setup(props) {
        const { widget } = props;

        return () => {
            if (!widget.visible && widget.props.displayDirective !== 'show')
                return;

            return (
                <div class="letgo-skeleton__panel" style={{ display: widget.visible ? 'block' : 'none' }}>
                    {widget.body}
                </div>
            );
        };
    },
});
