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
        const { widget } = props;

        return () => {
            if (widget.visible)
                return;

            return (
                <FModal {...widget.props} show={true}>
                    {widget.body}
                </FModal>
            );
        };
    },
});
