import { defineComponent, PropType } from 'vue';
import { IWidget } from '../types';
import { widgetCls, disabledCls } from './widget.css';

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
            if (!widget.visible.value) {
                return null;
            }
            if (widget.disabled.value) {
                return (
                    <div class={[widgetCls, disabledCls]}>{widget.body}</div>
                );
            }
            if (props.onClick) {
                return (
                    <div class={widgetCls} onClick={props.onClick}>
                        {widget.body}
                    </div>
                );
            }
            return <>{widget.body}</>;
        };
    },
});
