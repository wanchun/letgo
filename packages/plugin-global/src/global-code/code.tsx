import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import type { CodeItem } from '@webank/letgo-types';
import { useModel } from '@webank/letgo-common';
import CodeEdit from './edit/code-edit';
import { globalCodeCls, leftPanelCls, rightPanelCls } from './code.css';

// TODO 拖拽交换 code 顺序
export const GlobalCode = defineComponent({
    name: 'GlobalCode',
    props: {
        modelValue: Boolean,
        designer: Object as PropType<Designer>,
    },
    setup(props, { emit }) {
        const [innerVisible] = useModel(props, emit);

        const code = computed(() => {
            return props.designer.project.code;
        });
        const codesInstance = computed(() => {
            return props.designer.project.codesInstance;
        });
        const changeCodeId = (id: string, preId: string) => {
            const codesInstance = props.designer.currentDocument.state.codesInstance;
            if (codesInstance) {
                Object.keys(codesInstance).forEach((currentId) => {
                    if (codesInstance[currentId].deps.includes(preId))
                        props.designer.currentDocument.code.scopeVariableChange(currentId, id, preId);
                });
            }
        };

        const currentCodeItem = ref<CodeItem>();
        const changeCurrentCodeItem = (item: CodeItem | null) => {
            currentCodeItem.value = item;
        };

        return () => {
            return <FDrawer
                width="1024px"
                v-model={[innerVisible.value, 'show']}
                title="全局状态"
            >
                <div class={globalCodeCls}>
                    <CodeList
                        class={leftPanelCls}
                        hasFunction
                        code={code.value}
                        currentCodeItem={currentCodeItem.value}
                        onChangeCurrentCodeItem={changeCurrentCodeItem}
                        codesInstance={codesInstance.value}
                        onCodeIdChange={changeCodeId}
                    />
                    <CodeEdit class={rightPanelCls} project={props.designer.project} codeItem={currentCodeItem.value} />
                </div>
            </FDrawer>;
        };
    },
});
