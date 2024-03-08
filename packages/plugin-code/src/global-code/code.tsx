import { Teleport, computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeList } from '@webank/letgo-components';
import { isDirectory } from '@webank/letgo-types';
import type { ICodeItemOrDirectory, IEnumCodeType } from '@webank/letgo-types';
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

        const hasCodeId = (id: string) => {
            return designer.project.code.hasCodeId(id) || innerGlobalVariable.includes(id);
        };

        useOnClickSim(designer, () => {
            activeItem.value = null;
        });

        return () => {
            return (
                <div class="letgo-plg-code__edit">
                    <CodeList
                        hasFunction
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
                                <div v-show={props.currentTab === 'globalLogic' && activeItem.value} class="letgo-plg-code__detail">
                                    <CodeEdit project={props.designer.project} codeItem={activeItem.value} />
                                </div>
                            </Teleport>
                        )
                    }
                </div>
            );
        };
    },
});
