import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FModal } from '@fesjs/fes-design';
import type { IModal } from '../types';

export default defineComponent({
    name: 'Modal',
    props: {
        widget: {
            type: Object as PropType<IModal>,
        },
    },
    setup(props) {
        return () => {
            const { widget } = props;
            return (
                <FModal {...widget.props} show={widget.visible}>
                    {widget.body}
                </FModal>
            );
        };
    },
});
