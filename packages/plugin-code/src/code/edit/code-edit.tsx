import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { ICodeItem, IPublicModelProject } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { ComputedEdit, FunctionEdit, StateEdit, useCodeHints } from '@webank/letgo-components';
import QueryEdit from './query-edit/query-edit';

export default defineComponent({
    props: {
        project: {
            type: Object as PropType<IPublicModelProject>,
        },
        codeItem: Object as PropType<ICodeItem>,
    },
    setup(props) {
        const code = computed(() => {
            return props.project.currentDocument?.code;
        });
        const hints = useCodeHints({
            project: props.project,
        });

        return () => {
            if (props.codeItem) {
                if (props.codeItem.type === IEnumCodeType.TEMPORARY_STATE)
                    return <StateEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_COMPUTED)
                    return <ComputedEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_QUERY)
                    return <QueryEdit project={props.project} hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
                    return <FunctionEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
            }

            return null;
        };
    },
});
