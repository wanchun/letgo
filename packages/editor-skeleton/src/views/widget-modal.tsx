import { defineComponent, PropType, ref } from 'vue';
import { FModal } from '@fesjs/fes-design';
import { WidgetModal } from '../widget';
import './widget-modal.less';

export default defineComponent({
    props: {
        widget: {
            type: Object as PropType<WidgetModal>,
        },
    },
    emits: ['click'],
    setup(props, { emit }) {
        const isShow = ref(false);
        const handleClick = (e: Event) => {
            if (!isShow.value) {
                isShow.value = true;
            }
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
                <>
                    <div class="letgo-widget" onClick={handleClick}>
                        {widget.body}
                    </div>
                    <FModal
                        show={isShow.value}
                        {...(widget.config.modalProps ?? {})}
                    >
                        {widget.modalBody}
                    </FModal>
                </>
            );
        };
    },
});
