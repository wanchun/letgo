import { computed, defineComponent, h, reactive } from 'vue';
import type { PropType } from 'vue';
import { FDropdown, FScrollbar } from '@fesjs/fes-design';
import { MoreOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import type { ICodeItem, ICodeItemOrDirectory, IPublicModelCode } from '@webank/letgo-types';
import { IEnumCodeType, IEnumResourceType } from '@webank/letgo-types';
import { cloneDeep, isNil } from 'lodash-es';
import { ComputedIcon, FolderIcon, JsIcon, RestIcon, StateIcon } from '../icons';
import CodeId from './code-id';
import './code.less';

const iconMap = {
    [IEnumCodeType.JAVASCRIPT_FUNCTION]: JsIcon,
    [IEnumCodeType.JAVASCRIPT_COMPUTED]: ComputedIcon,
    [IEnumCodeType.TEMPORARY_STATE]: StateIcon,
    folder: FolderIcon,
};

const resourceTypeIcon = {
    [IEnumResourceType.Query]: JsIcon,
    [IEnumResourceType.RESTQuery]: RestIcon,
};

const itemActionOptions = [
    {
        value: 'duplicate',
        label: '复制',
    },
    {
        value: 'rename',
        label: '重命名',
    },
    {
        value: 'delete',
        label: () => h('span', {
            style: 'color: #ff4d4f',
        }, '删除'),
    },
];

const folderActionOptions = [
    {
        value: 'unground',
        label: '解除归类',
    },
    {
        value: 'delete',
        label: () => h('span', {
            style: 'color: #ff4d4f',
        }, '删除'),
    },
];

// TODO 拖拽交换 code 顺序
export const CodeList = defineComponent({
    name: 'CodeList',
    props: {
        currentValue: Object as PropType<ICodeItemOrDirectory>,
        onSelect: Function as PropType<((id?: string, type?: IEnumCodeType) => void)>,
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
            {
                value: 'folder',
                label: '文件夹',
                icon: () => h(iconMap.folder),
            },
        ].filter(Boolean);

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
            return props.code?.directories.map((item) => {
                return (
                    <li class="letgo-logic-code__item">
                        <FolderIcon />
                        <span class="letgo-logic-code__item_id">{item.id}</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={folderActionOptions}>
                            <MoreOutlined class="letgo-logic-code__icon-more" />
                        </FDropdown>
                    </li>
                );
            });
        };

        const codeItemsEditing = reactive<Record<string, boolean>>({});
        const onCodeItemAction = (value: string, item: ICodeItem) => {
            if (value === 'duplicate') {
                const newItem = cloneDeep(item);
                newItem.id = props.code.genCodeId(item.type);
                props.code.addCodeItem(newItem);
                props.onSelect(newItem.id, newItem.type);
            }
            else if (value === 'rename') {
                codeItemsEditing[item.id] = true;
            }
            else if (value === 'delete') {
                props.code.deleteCodeItem(item.id);
                if (props.currentValue?.id === item.id)
                    props.onSelect(null);
            }
        };

        const renderCodeIcon = (item: ICodeItem) => {
            if (item.type === IEnumCodeType.JAVASCRIPT_QUERY)
                return h(resourceTypeIcon[item.resourceType]);

            if (iconMap[item.type])
                return h(iconMap[item.type]);
        };

        const onSelectCodeItem = (codeItem: ICodeItem) => {
            if (props.currentValue?.id === codeItem.id)
                codeItemsEditing[codeItem.id] = true;
            else
                props.onSelect(codeItem.id, codeItem.type);
        };
        const innerCodeItems = computed<ICodeItem[]>(() => {
            return props.code.code.filter((item) => {
                return !isNil(props.searchText) ? item.id.includes(props.searchText) : true;
            });
        });

        const renderCode = () => {
            return innerCodeItems.value.map((item) => {
                return (
                    <div onClick={() => onSelectCodeItem(item)} class={['letgo-logic-code__item', props.currentValue?.id === item.id ? 'letgo-logic-code__item--active' : '']}>
                        {renderCodeIcon(item)}
                        <CodeId id={item.id} v-model:isEditing={codeItemsEditing[item.id]} hasCodeId={props.hasCodeId} onChange={changeCodeId} />
                        <FDropdown onClick={value => onCodeItemAction(value, item)} appendToContainer={false} trigger="click" placement="bottom-end" options={itemActionOptions}>
                            <MoreOutlined class="letgo-logic-code__icon-more" />
                        </FDropdown>
                    </div>
                );
            });
        };

        const addCodeItem = (val: string) => {
            const option = createdTypeOptions.find(item => item.value === val);

            if (option.codeType) {
                const item = props.code.addCodeItemWithType(option.codeType, val as IEnumResourceType);
                props.onSelect(item.id, item.type);
            }
            else if (val === 'folder') {
                const item = props.code.addFolder();
                props.onSelect(item.id);
            }
            else {
                const item = props.code.addCodeItemWithType(val as IEnumCodeType);
                props.onSelect(item.id, item.type);
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
                        {renderFolders()}
                        {renderCode()}
                    </FScrollbar>
                </div>
            );
        };
    },
});
