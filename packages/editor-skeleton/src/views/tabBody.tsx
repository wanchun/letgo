import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { ITabPanel } from '../types';

export default defineComponent({
    name: 'TabBody',
    props: {
        widget: {
            type: Object as PropType<ITabPanel>,
        },
    },
    setup(props) {
        const { widget } = props;

        return () => {
            if (!widget.visible)
                return null;

            return <>{widget.body}</>;
        };
    },
});
