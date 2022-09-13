import { defineComponent, PropType } from 'vue';
import { IWidget } from '../types';
import './widget.less';

export default defineComponent({
    name: 'Widget',
    props: {
        widget: {
            type: Object as PropType<IWidget>,
        },
    },
    emits: ['click'],
    setup(props, { emit }) {
        const handleClick = (e: Event) => {
            emit('click', e);
        };
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
            return (
                <div class="letgo-widget" onClick={handleClick}>
                    {widget.body}
                </div>
            );
        };
    },
});
