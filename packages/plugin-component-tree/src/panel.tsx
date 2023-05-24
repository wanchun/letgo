import type {
    PropType,
} from 'vue';
import {
    defineComponent,
} from 'vue';

import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';

export default defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        return () => {
            return '组件树';
        };
    },
});
