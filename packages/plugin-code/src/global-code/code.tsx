import { Teleport, computed, defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import type { ICodeItem } from '@webank/letgo-types';
import { innerGlobalVariable } from '@webank/letgo-common';
import { useOnClickSim } from '../use';
import CodeEdit from './edit/code-edit';

export const GlobalCode = defineComponent({
    name: 'GlobalCode',
    props: {
        modelValue: Boolean,
        designer: Object as PropType<Designer>,
        currentTab: String,
        searchText: String,
        rootEl: HTMLElement,
    },
    setup(props) {
        const { designer } = props;
        const code = computed(() => {
            return designer.project.code;
        });
        const codesInstance = computed(() => {
            return designer.project.codesInstance;
        });

        const currentCodeItem = ref<ICodeItem>();
        const changeCurrentCodeItem = (item: ICodeItem | null) => {
            currentCodeItem.value = item;
        };

        watch(code, () => {
            if (currentCodeItem.value) {
                const codeItem = code.value.getCodeItem(currentCodeItem.value.id);
                if (codeItem)
                    changeCurrentCodeItem(codeItem);
                else
                    changeCurrentCodeItem(null);
            }
        });

        const hasCodeId = (id: string) => {
            return designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        useOnClickSim(designer, () => {
            currentCodeItem.value = null;
        });

        return () => {
            return (
                <div class="letgo-plg-code__edit">
                    <CodeList
                        hasFunction
                        code={code.value}
                        hasCodeId={hasCodeId}
                        currentCodeItem={currentCodeItem.value}
                        onChangeCurrentCodeItem={changeCurrentCodeItem}
                        codesInstance={codesInstance.value}
                        searchText={props.searchText}
                    />
                    {
                        props.rootEl && (
                            <Teleport to={props.rootEl}>
                                <div v-show={props.currentTab === 'globalLogic' && currentCodeItem.value} class="letgo-plg-code__detail">
                                    <CodeEdit project={props.designer.project} codeItem={currentCodeItem.value} />
                                </div>
                            </Teleport>
                        )
                    }
                </div>
            );
        };
    },
});
