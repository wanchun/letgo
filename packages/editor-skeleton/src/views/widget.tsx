import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { IWidget } from '../types';
import './widget.less';

export default defineComponent({
    name: 'Widget',
    props: {
        widget: {
            type: Object as PropType<IWidget>,
        },
        onClick: {
            type: Function,
        },
    },
    setup(props) {
        const { widget } = props;

        const isActive = computed(() => {
            if (!props.widget.linked)
                return false;

            return props.widget.linked?.visible;
        });

        return () => {
            if (!widget.visible)
                return null;

            if (widget.disabled) {
                return (
                    <div class="letgo-skeleton__widget letgo-skeleton__widget--disabled">{widget.body}</div>
                );
            }
            if (props.onClick) {
                return (
                    <div class={['letgo-skeleton__widget', isActive.value && 'letgo-skeleton__widget--active']} onClick={() => props.onClick()}>
                        {widget.body}
                    </div>
                );
            }
            return <>{widget.body}</>;
        };
    },
});
