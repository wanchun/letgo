import { defineComponent, PropType } from 'vue';
import { FModal } from '@fesjs/fes-design';
import { Modal } from '../widget';
import './modal.less';

export default defineComponent({
    name: 'Modal',
    props: {
        widget: {
            type: Object as PropType<Modal>,
        },
    },
    setup(props) {
        return () => {
            const { widget } = props;
            if (!widget.visible.value) {
                return null;
            }
            return (
                <FModal show={true} {...widget.props}>
                    {widget.body}
                </FModal>
            );
        };
    },
});
