import { Teleport, computed, defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import { innerGlobalVariable } from '@webank/letgo-common';
import { IEnumCodeType, isDirectory } from '@webank/letgo-types';
import type { ICodeItemOrDirectory } from '@webank/letgo-types';
import { useOnClickSim } from '../use';
import CodeEdit from './edit/code-edit';

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
            return currentDocument.value?.state.hasStateId(id) || code.value.hasCodeId(id) || designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        const activeItem = ref<ICodeItemOrDirectory>();
        const onSelectItem = (id: string) => {
            if (id)
                activeItem.value = code.value.getCodeItem(id) || code.value.getDirectory(id);
            else
                activeItem.value = null;
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
                        extendActions={[IEnumCodeType.JAVASCRIPT_QUERY]}
                        code={code.value}
                        hasCodeId={hasCodeId}
                        activeId={activeItem.value?.id}
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
