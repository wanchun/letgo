import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FDropdown, FScrollbar } from '@fesjs/fes-design';
import { MoreOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import type { ICodeItem, IPublicModelCode } from '@webank/letgo-types';
import { IEnumCodeType, IEnumResourceType } from '@webank/letgo-types';
import { cloneDeep, isNil } from 'lodash-es';
import { ComputedIcon, FolderIcon, JsIcon, RestIcon, StateIcon } from '../icons';
import CodeId from './code-id';
import './code.less';

const iconMap = {
    [IEnumCodeType.JAVASCRIPT_FUNCTION]: JsIcon,
    [IEnumCodeType.JAVASCRIPT_COMPUTED]: ComputedIcon,
    [IEnumCodeType.TEMPORARY_STATE]: StateIcon,
};

const resourceTypeIcon = {
    [IEnumResourceType.Query]: JsIcon,
    [IEnumResourceType.RESTQuery]: RestIcon,
};

// TODO 拖拽交换 code 顺序
export const CodeList = defineComponent({
    name: 'CodeList',
    props: {
        currentCodeItem: Object as PropType<ICodeItem>,
        onChangeCurrentCodeItem: Function as PropType<((codeItem: ICodeItem) => void)>,
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
        const options = [
            props.hasQuery && {
                value: IEnumResourceType.RESTQuery,
                codeType: IEnumCodeType.JAVASCRIPT_QUERY,
                label: '查询',
                icon: () => h(resourceTypeIcon[IEnumResourceType.RESTQuery]),
            },
            props.hasFunction && {
                value: IEnumCodeType.JAVASCRIPT_FUNCTION,
                label: 'Js函数',
                icon: () => h(iconMap[IEnumCodeType.JAVASCRIPT_FUNCTION]),
            },
            {
                value: IEnumCodeType.JAVASCRIPT_COMPUTED,
                label: '计算变量',
                icon: () => h(iconMap[IEnumCodeType.JAVASCRIPT_COMPUTED]),
            },
            {
                value: IEnumCodeType.TEMPORARY_STATE,
                label: '变量',
                icon: () => h(iconMap[IEnumCodeType.TEMPORARY_STATE]),
            },
        ].filter(Boolean);

        const commonOptions = [
            {
                value: 'duplicate',
                label: '复制',
            },
            {
                value: 'delete',
                label: () => h('span', {
                    style: 'color: #ff4d4f',
                }, '删除'),
            },
        ];

        const onCommonAction = (value: string, item: ICodeItem) => {
            if (value === 'duplicate') {
                const newItem = cloneDeep(item);
                newItem.id = props.code.genCodeId(item.type);
                props.code?.addCodeItem(newItem);
                props.onChangeCurrentCodeItem(newItem);
            }
            else if (value === 'delete') {
                props.code?.deleteCodeItem(item.id);
                if (props.currentCodeItem?.id === item.id)
                    props.onChangeCurrentCodeItem(null);
            }
        };

        const changeCodeId = (id: string, preId: string) => {
            props.code?.changeCodeId(id, preId);
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

        const renderFolders = () => {
            return props.code?.directories.map((item: any) => {
                return (
                    <li class="letgo-logic-code__item">
                        <FolderIcon />
                        <span class="letgo-logic-code__item_id">{item.name}</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                            <MoreOutlined class="letgo-logic-code__icon-more" />
                        </FDropdown>
                    </li>
                );
            });
        };

        const renderCodeIcon = (item: ICodeItem) => {
            if (item.type === IEnumCodeType.JAVASCRIPT_QUERY)
                return h(resourceTypeIcon[item.resourceType]);

            if (iconMap[item.type])
                return h(iconMap[item.type]);
        };

        const renderCode = () => {
            return props.code?.code.filter((item) => {
                return !isNil(props.searchText) ? item.id.includes(props.searchText) : true;
            }).map((item: any) => {
                return (
                    <div onClick={() => props.onChangeCurrentCodeItem(item)} class={['letgo-logic-code__item', props.currentCodeItem?.id === item.id ? 'letgo-logic-code__item--active' : '']}>
                        {renderCodeIcon(item)}
                        <CodeId id={item.id} hasCodeId={props.hasCodeId} onChange={changeCodeId} />
                        <FDropdown onClick={value => onCommonAction(value, item)} appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                            <MoreOutlined class="letgo-logic-code__icon-more" />
                        </FDropdown>
                    </div>
                );
            });
        };

        const addCodeItem = (val: string) => {
            const option = options.find(item => item.value === val);
            let item;
            if (option.codeType)
                item = props.code?.addCodeItemWithType(option.codeType, val as IEnumResourceType);
            else
                item = props.code?.addCodeItemWithType(val as IEnumCodeType);
            props.onChangeCurrentCodeItem(item);
        };

        return () => {
            return (
                <div class="letgo-logic-code">
                    <div class="letgo-logic-code__header">
                        <FDropdown trigger="click" onClick={addCodeItem} placement="bottom-start" options={options}>
                            <PlusOutlined class="letgo-logic-code__header-icon" />
                        </FDropdown>
                    </div>
                    <FScrollbar class="letgo-logic-code__body">
                        {renderFolders()}
                        {renderCode()}
                    </FScrollbar>
                </div>
            );
        };
    },
});
