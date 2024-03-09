import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FDropdown, FScrollbar } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import type { IPublicModelCode } from '@webank/letgo-types';
import { IEnumCodeType, IEnumResourceType } from '@webank/letgo-types';
import { FolderIcon } from '../icons';
import { LogicList } from './logic-list/logic-list';
import { IconMap, ResourceTypeIcon } from './constants';
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
        hasQuery: Boolean,
        hasFunction: {
            type: Boolean,
            default: true,
        },
        onCodeIdChange: Function as PropType<((id: string, preId: string) => void)>,
        searchText: String,
    },
    setup(props) {
        const createdTypeOptions = [
            props.hasQuery && {
                value: IEnumResourceType.RESTQuery,
                codeType: IEnumCodeType.JAVASCRIPT_QUERY,
                label: '查询',
                icon: () => h(ResourceTypeIcon[IEnumResourceType.RESTQuery]),
            },
            props.hasFunction && {
                value: IEnumCodeType.JAVASCRIPT_FUNCTION,
                label: 'Js函数',
                icon: () => h(IconMap[IEnumCodeType.JAVASCRIPT_FUNCTION]),
            },
            {
                value: IEnumCodeType.JAVASCRIPT_COMPUTED,
                label: '计算变量',
                icon: () => h(IconMap[IEnumCodeType.JAVASCRIPT_COMPUTED]),
            },
            {
                value: IEnumCodeType.TEMPORARY_STATE,
                label: '变量',
                icon: () => h(IconMap[IEnumCodeType.TEMPORARY_STATE]),
            },
            {
                value: 'folder',
                label: '文件夹',
                icon: () => h(FolderIcon),
            },
        ].filter(Boolean);

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

        const addCodeItem = (val: string) => {
            const option = createdTypeOptions.find(item => item.value === val);

            if (option.codeType) {
                const item = props.code.addCodeItemWithType(option.codeType, val as IEnumResourceType);
                props.onSelect(item.id);
            }
            else if (val !== 'folder') {
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
                        <FDropdown trigger="click" onClick={addCodeItem} placement="bottom-start" options={createdTypeOptions}>
                            <PlusOutlined class="letgo-logic-code__header-icon" />
                        </FDropdown>
                    </div>
                    <FScrollbar class="letgo-logic-code__body">
                        <LogicList
                            activeId={props.activeId}
                            code={props.code}
                            searchText={props.searchText}
                            onSelect={props.onSelect}
                        />
                    </FScrollbar>
                </div>
            );
        };
    },
});
