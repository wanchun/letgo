import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import type { ICodeItem } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { ComputedEdit, FunctionEdit, StateEdit } from '@webank/letgo-components';
import QueryEdit from './query-edit/query-edit';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
        codeItem: Object as PropType<ICodeItem>,
    },
    setup(props) {
        const currentDocument = computed(() => {
            return props.designer.currentDocument;
        });
        const code = computed(() => {
            return currentDocument.value?.code;
        });

        return () => {
            if (props.codeItem) {
                if (props.codeItem.type === IEnumCodeType.TEMPORARY_STATE)
                    return <StateEdit documentModel={props.designer.currentDocument} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_COMPUTED)
                    return <ComputedEdit documentModel={props.designer.currentDocument} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_QUERY)
                    return <QueryEdit documentModel={props.designer.currentDocument} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
                    return <FunctionEdit documentModel={props.designer.currentDocument} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
            }

            return null;
        };
    },
});
