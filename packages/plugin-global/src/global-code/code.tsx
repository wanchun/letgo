import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@harrywan/letgo-designer';
import { CodeList } from '@harrywan/letgo-components';
import type { CodeItem } from '@harrywan/letgo-types';
import { innerGlobalVariable } from '@harrywan/letgo-common';
import CodeEdit from './edit/code-edit';
import { globalCodeCls, leftPanelCls, rightPanelCls } from './code.css';

export const GlobalCode = defineComponent({
    name: 'GlobalCode',
    props: {
        modelValue: Boolean,
        designer: Object as PropType<Designer>,
    },
    setup(props) {
        const code = computed(() => {
            return props.designer.project.code;
        });
        const codesInstance = computed(() => {
            return props.designer.project.codesInstance;
        });

        const currentCodeItem = ref<CodeItem>();
        const changeCurrentCodeItem = (item: CodeItem | null) => {
            currentCodeItem.value = item;
        };

        const hasCodeId = (id: string) => {
            return props.designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        return () => {
            return (
                <div class={globalCodeCls}>
                    <CodeList
                        class={leftPanelCls}
                        hasFunction
                        code={code.value}
                        hasCodeId={hasCodeId}
                        currentCodeItem={currentCodeItem.value}
                        onChangeCurrentCodeItem={changeCurrentCodeItem}
                        codesInstance={codesInstance.value}
                    />
                    <CodeEdit class={rightPanelCls} project={props.designer.project} codeItem={currentCodeItem.value} />
                </div>
            );
        };
    },
});
