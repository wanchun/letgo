import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import type { ICodeItem } from '@webank/letgo-types';
import { innerGlobalVariable } from '@webank/letgo-common';
import CodeEdit from './edit/code-edit';
import './code.less';

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

        const currentCodeItem = ref<ICodeItem>();
        const changeCurrentCodeItem = (item: ICodeItem | null) => {
            currentCodeItem.value = item;
        };

        const hasCodeId = (id: string) => {
            return props.designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        return () => {
            return (
                <div class="letgo-global__code">
                    <CodeList
                        class="letgo-global__code-left"
                        hasFunction
                        code={code.value}
                        hasCodeId={hasCodeId}
                        currentCodeItem={currentCodeItem.value}
                        onChangeCurrentCodeItem={changeCurrentCodeItem}
                        codesInstance={codesInstance.value}
                    />
                    <CodeEdit class="letgo-global__code-right" project={props.designer.project} codeItem={currentCodeItem.value} />
                </div>
            );
        };
    },
});
