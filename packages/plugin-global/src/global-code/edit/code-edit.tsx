import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Project } from '@webank/letgo-designer';
import type { ICodeItem } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { ComputedEdit, FunctionEdit, StateEdit } from '@webank/letgo-components';

export default defineComponent({
    props: {
        project: Object as PropType<Project>,
        codeItem: Object as PropType<ICodeItem>,
    },
    setup(props) {
        const code = computed(() => {
            return props.project.code;
        });
        const hints = computed(() => {
            return {
                codesInstance: props.project.codesInstance,
            };
        });

        return () => {
            if (props.codeItem) {
                if (props.codeItem.type === IEnumCodeType.TEMPORARY_STATE)
                    return <StateEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_COMPUTED)
                    return <ComputedEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
                if (props.codeItem.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
                    return <FunctionEdit hints={hints.value} codeItem={props.codeItem} changeContent={code.value?.changeCodeItemContent} />;
            }

            return null;
        };
    },
});
