import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { ICodeItem, IPublicModelProject } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { useCodeHints } from '@webank/letgo-components';
import { ComputedEdit, FunctionEdit, HookEdit, QueryEdit, StateEdit } from '../common';

export default defineComponent({
    props: {
        project: Object as PropType<IPublicModelProject>,
        codeItem: Object as PropType<ICodeItem>,
    },
    setup(props) {
        const code = computed(() => {
            return props.project.code;
        });

        const hints = useCodeHints({
            project: props.project,
            isGlobal: true,
        });

        return () => {
            if (props.codeItem) {
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_QUERY)
                    return <QueryEdit project={props.project} hints={hints.value} isGlobal codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.TEMPORARY_STATE)
                    return <StateEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_COMPUTED)
                    return <ComputedEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
                    return <FunctionEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.LIFECYCLE_HOOK)
                    return <HookEdit hints={hints.value} type="project" codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
            }

            return null;
        };
    },
});
