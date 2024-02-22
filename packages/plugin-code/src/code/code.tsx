import { Teleport, computed, defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import { innerGlobalVariable } from '@webank/letgo-common';
import { FScrollbar } from '@fesjs/fes-design';
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
            return (
                <div class="letgo-plg-code__edit">
                    <FScrollbar>
                        <CodeList
                            hasQuery
                            code={code.value}
                            hasCodeId={hasCodeId}
                            currentCodeItem={currentCodeItem.value}
                            onChangeCurrentCodeItem={changeCurrentCodeItem}
                            codesInstance={codesInstance.value}
                            searchText={props.searchText}
                        />
                    </FScrollbar>
                    <Teleport to={document.body}>
                        <FScrollbar v-show={props.currentTab === 'code' && currentCodeItem.value} class="letgo-plg-code__detail">
                            <CodeEdit designer={props.designer} />
                        </FScrollbar>
                    </Teleport>
                </div>

            );
        };
    },
});
