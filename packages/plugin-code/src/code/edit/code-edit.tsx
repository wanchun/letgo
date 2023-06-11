import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeType } from '@webank/letgo-types';
import useCode from '../useCode';

import StateEdit from './state-edit';
import ComputedEdit from './computed-edit';
import QueryEdit from './query-edit/query-edit';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const currentDocument = computed(() => {
            return props.designer.currentDocument;
        });
        const code = computed(() => {
            return currentDocument.value?.code;
        });
        const {
            currentCodeItem,
        } = useCode();

        return () => {
            if (currentCodeItem.value) {
                if (currentCodeItem.value.type === CodeType.TEMPORARY_STATE)
                    return <StateEdit documentModel={props.designer.currentDocument} codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
                if (currentCodeItem.value.type === CodeType.JAVASCRIPT_COMPUTED)
                    return <ComputedEdit codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
                if (currentCodeItem.value.type === CodeType.JAVASCRIPT_QUERY)
                    return <QueryEdit documentModel={props.designer.currentDocument} codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
            }

            return null;
        };
    },
});
