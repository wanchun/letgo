import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { FScrollbar } from '@fesjs/fes-design';
import type { ICodeItemOrDirectory, IEnumCodeType, IPublicModelCode } from '@webank/letgo-types';
import { LogicList } from './logic-list/logic-list';
import { AddAction } from './logic-list/add';
import './code-list.less';

export const CodeList = defineComponent({
    name: 'CodeList',
    props: {
        activeId: String,
        onSelect: Function as PropType<((id?: string) => void)>,
        code: Object as PropType<IPublicModelCode>,
        codesInstance: {
            type: Object as PropType<Record<string, any>>,
        },
        hasCodeId: Function as PropType<(id: string) => boolean>,
        extendActions: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        },
        searchText: String,
        type: String as PropType<'project' | 'page'>,
    },
    setup(props) {
        const logicListRef = ref();
        const addCodeItem = (val: string, params?: Record<string, any>) => {
            let item: ICodeItemOrDirectory;
            if (val !== 'directory')
                item = props.code.addCodeItemWithType(val as IEnumCodeType, params);
            else
                item = props.code.addDirectory();

            props.onSelect(item.id);
            logicListRef.value.toEdit(item.id);
        };

        return () => {
            return (
                <div class="letgo-logic-code">
                    <div class="letgo-logic-code__header">
                        <AddAction type={props.type} extendActions={props.extendActions.concat('directory')} onAdd={addCodeItem} />
                    </div>
                    <FScrollbar class="letgo-logic-code__body">
                        <LogicList
                            type={props.type}
                            ref={logicListRef}
                            activeId={props.activeId}
                            code={props.code}
                            extendActions={props.extendActions}
                            searchText={props.searchText}
                            codesInstance={props.codesInstance}
                            hasCodeId={props.hasCodeId}
                            onSelect={props.onSelect}
                        />
                    </FScrollbar>
                </div>
            );
        };
    },
});
