import { Teleport, computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import { innerGlobalVariable } from '@webank/letgo-common';
import { useOnClickSim } from '../use';
import CodeEdit from './edit/code-edit';
import useCode from './useCode';

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

        const {
            currentCodeItem,
            changeCurrentCodeItem,
        } = useCode();

        useOnClickSim(designer, () => {
            currentCodeItem.value = null;
        });

        return () => {
            return (
                <div class="letgo-plg-code__edit">
                    <CodeList
                        hasQuery
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
                                <div v-show={props.currentTab === 'code' && currentCodeItem.value} class="letgo-plg-code__detail">
                                    <CodeEdit designer={props.designer} />
                                </div>
                            </Teleport>
                        )
                    }
                </div>

            );
        };
    },
});
