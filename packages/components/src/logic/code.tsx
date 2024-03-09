import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FScrollbar } from '@fesjs/fes-design';
import type { IEnumCodeType, IEnumResourceType, IPublicModelCode } from '@webank/letgo-types';
import { LogicList } from './logic-list/logic-list';
import { AddAction } from './logic-list/add';
import './code.less';

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
        onCodeIdChange: Function as PropType<((id: string, preId: string) => void)>,
        searchText: String,
    },
    setup(props) {
        const changeCodeId = (id: string, preId: string) => {
            props.code.changeCodeId(id, preId);
            if (props.codesInstance) {
                const codesInstance = props.codesInstance as Record<string, any>;
                Object.keys(codesInstance).forEach((currentId) => {
                    if (codesInstance[currentId].deps.includes(preId))
                        props.code.scopeVariableChange(currentId, id, preId);
                });
            }
            if (props.onCodeIdChange)
                props.onCodeIdChange(id, preId);
        };

        const addCodeItem = (val: string, codeType?: IEnumCodeType) => {
            if (codeType) {
                const item = props.code.addCodeItemWithType(codeType, val as IEnumResourceType);
                props.onSelect(item.id);
            }
            else if (val !== 'directory') {
                const item = props.code.addCodeItemWithType(val as IEnumCodeType);
                props.onSelect(item.id);
            }
            else {
                const item = props.code.addDirectory();
                props.onSelect(item.id);
            }
        };

        return () => {
            return (
                <div class="letgo-logic-code">
                    <div class="letgo-logic-code__header">
                        <AddAction extendActions={props.extendActions.concat('directory')} onAdd={addCodeItem} />
                    </div>
                    <FScrollbar class="letgo-logic-code__body">
                        <LogicList
                            activeId={props.activeId}
                            code={props.code}
                            extendActions={props.extendActions}
                            searchText={props.searchText}
                            onSelect={props.onSelect}
                        />
                    </FScrollbar>
                </div>
            );
        };
    },
});
