import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import type { Project } from '@webank/letgo-designer';
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
        project: Object as PropType<Project>,
    },
    setup(props, { emit }) {
        const [innerVisible] = useModel(props, emit);

        const code = computed(() => {
            return props.project.code;
        });
        const codesInstance = computed(() => {
            return props.project.codesInstance;
        });

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
                    />
                    <CodeEdit class={rightPanelCls} project={props.project} codeItem={currentCodeItem.value} />
                </div>
            </FDrawer>;
        };
    },
});
