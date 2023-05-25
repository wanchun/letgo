import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FModal } from '@fesjs/fes-design';
import type { Modal } from '../widget';

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
            if (!widget.visible)
                return null;

            return (
                <FModal show={true} {...widget.props}>
                    {widget.body}
                </FModal>
            );
        };
    },
});
