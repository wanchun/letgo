import type { PropType } from 'vue';
import {
    computed,

    defineComponent,
} from 'vue';
import {
    FTree,
} from '@fesjs/fes-design';

import type { Designer } from '@webank/letgo-designer';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const globalState = computed(() => {
            return props.designer.project.config;
        });

        return () => {
            return (
                <FTree selectable={false}>

                </FTree>
            );
        };
    },
});
