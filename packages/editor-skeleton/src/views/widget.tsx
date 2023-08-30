import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { IWidget } from '../types';
import { activeCls, disabledCls, widgetCls } from './widget.css';

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
        const isActive = computed(() => {
            if (!props.widget.linked)
                return false;

            return props.widget.linked?.visible;
        });

        return () => {
            const { widget } = props;
            if (!widget.visible)
                return null;

            if (widget.disabled) {
                return (
                    <div class={[widgetCls, disabledCls]}>{widget.body}</div>
                );
            }
            if (props.onClick) {
                return (
                    <div class={[widgetCls, isActive.value && activeCls]} onClick={() => props.onClick()}>
                        {widget.body}
                    </div>
                );
            }
            return <>{widget.body}</>;
        };
    },
});
