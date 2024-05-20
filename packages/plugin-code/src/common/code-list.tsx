import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { FScrollbar } from '@fesjs/fes-design';
import type { ICodeItemOrDirectory, IEnumCodeType, IEnumResourceType, IPublicModelCode } from '@webank/letgo-types';
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
    },
    setup(props) {
        const logicListRef = ref();
        const addCodeItem = (val: string, codeType?: IEnumCodeType) => {
            let item: ICodeItemOrDirectory;
            if (codeType)
                item = props.code.addCodeItemWithType(codeType, val as IEnumResourceType);
            else if (val !== 'directory')
                item = props.code.addCodeItemWithType(val as IEnumCodeType);
            else
                item = props.code.addDirectory();

            props.onSelect(item.id);
            logicListRef.value.toEdit(item.id);
        };

        return () => {
            return (
                <div class="letgo-logic-code">
                    <div class="letgo-logic-code__header">
                        <AddAction extendActions={props.extendActions.concat('directory')} onAdd={addCodeItem} />
                    </div>
                    <FScrollbar class="letgo-logic-code__body">
                        <LogicList
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
