import { computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@fesjs/letgo-designer';
import { CodeList } from '@fesjs/letgo-components';
import { innerGlobalVariable } from '@fesjs/letgo-common';

import useCode from './useCode';

// TODO 拖拽交换 code 顺序
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
        const codesInstance = computed(() => {
            return currentDocument.value?.state.codesInstance;
        });

        const hasCodeId = (id: string) => {
            return currentDocument.value?.state.hasStateId(id) || props.designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        const {
            currentCodeItem,
            changeCurrentCodeItem,
        } = useCode();

        return () => {
            return <CodeList
                hasQuery
                code={code.value}
                hasCodeId={hasCodeId}
                currentCodeItem={currentCodeItem.value}
                onChangeCurrentCodeItem={changeCurrentCodeItem}
                codesInstance={codesInstance.value}
            />;
        };
    },
});
