import { Teleport, computed, defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import { innerGlobalVariable } from '@webank/letgo-common';
import { isDirectory } from '@webank/letgo-types';
import type { ICodeItemOrDirectory, IEnumCodeType } from '@webank/letgo-types';
import { useOnClickSim } from '../use';
import CodeEdit from './edit/code-edit';

// TODO 拖拽交换 code 顺序
export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
        currentTab: String,
        searchText: String,
        rootEl: HTMLElement,
    },
    setup(props) {
        const { designer } = props;
        const currentDocument = computed(() => {
            return designer.currentDocument;
        });
        const code = computed(() => {
            return currentDocument.value?.code;
        });
        const codesInstance = computed(() => {
            return currentDocument.value?.state.codesInstance;
        });

        const hasCodeId = (id: string) => {
            return currentDocument.value?.state.hasStateId(id) || designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        const activeItem = ref<ICodeItemOrDirectory>();
        const onSelectItem = (id: string, type?: IEnumCodeType) => {
            if (id) {
                if (type)
                    activeItem.value = code.value.getCodeItem(id);
                else
                    activeItem.value = code.value.getDirectory(id);
            }
            else {
                activeItem.value = null;
            }
        };
        watch(code, () => {
            activeItem.value = null;
        });

        useOnClickSim(designer, () => {
            activeItem.value = null;
        });

        return () => {
            return (
                <div class="letgo-plg-code__edit">
                    <CodeList
                        hasQuery
                        code={code.value}
                        hasCodeId={hasCodeId}
                        currentValue={activeItem.value}
                        onSelect={onSelectItem}
                        codesInstance={codesInstance.value}
                        searchText={props.searchText}
                    />
                    {
                        props.rootEl && !isDirectory(activeItem.value) && (
                            <Teleport to={props.rootEl}>
                                <div v-show={props.currentTab === 'code' && activeItem.value} class="letgo-plg-code__detail">
                                    <CodeEdit designer={props.designer} codeItem={activeItem.value} />
                                </div>
                            </Teleport>
                        )
                    }
                </div>

            );
        };
    },
});
