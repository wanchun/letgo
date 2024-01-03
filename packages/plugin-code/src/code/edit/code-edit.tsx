import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { IEnumCodeType } from '@webank/letgo-types';
import { ComputedEdit, FunctionEdit, StateEdit } from '@webank/letgo-components';
import useCode from '../useCode';
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
                if (currentCodeItem.value.type === IEnumCodeType.TEMPORARY_STATE)
                    return <StateEdit documentModel={props.designer.currentDocument} codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
                if (currentCodeItem.value.type === IEnumCodeType.JAVASCRIPT_COMPUTED)
                    return <ComputedEdit documentModel={props.designer.currentDocument} codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
                if (currentCodeItem.value.type === IEnumCodeType.JAVASCRIPT_QUERY)
                    return <QueryEdit documentModel={props.designer.currentDocument} codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
                if (currentCodeItem.value.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
                    return <FunctionEdit documentModel={props.designer.currentDocument} codeItem={currentCodeItem.value} changeContent={code.value?.changeCodeItemContent} />;
            }

            return null;
        };
    },
});
