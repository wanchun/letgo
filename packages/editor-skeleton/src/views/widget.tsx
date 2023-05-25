import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IWidget } from '../types';
import { disabledCls, widgetCls } from './widget.css';

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
                    <div class={widgetCls} onClick={() => props.onClick()}>
                        {widget.body}
                    </div>
                );
            }
            return <>{widget.body}</>;
        };
    },
});
