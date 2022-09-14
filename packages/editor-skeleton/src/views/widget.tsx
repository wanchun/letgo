import { defineComponent, PropType } from 'vue';
import { IWidget } from '../types';
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
        return () => {
            const { widget } = props;
            if (!widget.visible.value) {
                return null;
            }
            if (widget.disabled.value) {
                return (
                    <div class={'letgo-widget letgo-widget-disabled'}>
                        {widget.body}
                    </div>
                );
            }
            if (props.onClick) {
                return (
                    <div class="letgo-widget" onClick={props.onClick}>
                        {widget.body}
                    </div>
                );
            }
            return <>{widget.body}</>;
        };
    },
});
