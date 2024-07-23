import type { PropType } from 'vue';
import { defineComponent, ref, watch } from 'vue';
import type { IPanel } from '../types';
import './panel.less';

export default defineComponent({
    name: 'Panel',
    props: {
        widget: {
            type: Object as PropType<IPanel>,
        },
        displayDirective: String,
    },
    setup(props) {
        const { widget } = props;

        let hasRendered = false;
        watch(() => widget.visible, () => {
            if (widget.visible)
                hasRendered = true;
        }, {
            immediate: true,
        });

        return () => {
            if (!widget.visible && ((props.displayDirective === 'lazyShow' && !hasRendered) || !props.displayDirective || props.displayDirective === 'if'))
                return;

            return (
                <div class="letgo-skeleton__panel" style={{ display: widget.visible ? 'block' : 'none' }}>
                    {widget.body}
                </div>
            );
        };
    },
});
