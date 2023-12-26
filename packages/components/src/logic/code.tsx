import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import type { CodeItem, IPublicModelCode } from '@webank/letgo-types';
import { CodeType, ResourceType } from '@webank/letgo-types';
import { ComputedIcon, FolderIcon, JsIcon, RestIcon, StateIcon } from '../icons';
import CodeId from './code-id';
import './code.less';

const iconMap = {
    [CodeType.JAVASCRIPT_FUNCTION]: JsIcon,
    [CodeType.JAVASCRIPT_COMPUTED]: ComputedIcon,
    [CodeType.TEMPORARY_STATE]: StateIcon,
};

const resourceTypeIcon = {
    [ResourceType.Query]: JsIcon,
    [ResourceType.RESTQuery]: RestIcon,
};

// TODO 拖拽交换 code 顺序
export const CodeList = defineComponent({
    name: 'CodeList',
    props: {
        currentCodeItem: Object as PropType<CodeItem>,
        onChangeCurrentCodeItem: Function as PropType<((codeItem: CodeItem) => void)>,
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
    },
    setup(props) {
        const options = [
            props.hasQuery && {
                value: ResourceType.RESTQuery,
                codeType: CodeType.JAVASCRIPT_QUERY,
                label: '查询',
                icon: () => h(resourceTypeIcon[ResourceType.RESTQuery]),
            },
            props.hasFunction && {
                value: CodeType.JAVASCRIPT_FUNCTION,
                label: 'Js函数',
                icon: () => h(iconMap[CodeType.JAVASCRIPT_FUNCTION]),
            },
            {
                value: CodeType.JAVASCRIPT_COMPUTED,
                label: '计算变量',
                icon: () => h(iconMap[CodeType.JAVASCRIPT_COMPUTED]),
            },
            {
                value: CodeType.TEMPORARY_STATE,
                label: '变量',
                icon: () => h(iconMap[CodeType.TEMPORARY_STATE]),
            },
        ].filter(Boolean);

        // TODO 复制的功能
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

        const onCommonAction = (value: string, item: CodeItem) => {
            if (value === 'delete') {
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
                    <li class="letgo-comp-code__item">
                        <FolderIcon />
                        <span class="letgo-comp-code__item_id">{item.name}</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                            <MoreOutlined class="letgo-comp-code__icon-more" />
                        </FDropdown>
                    </li>
                );
            });
        };

        const renderCodeIcon = (item: CodeItem) => {
            if (item.type === CodeType.JAVASCRIPT_QUERY)
                return h(resourceTypeIcon[item.resourceType]);

            if (iconMap[item.type])
                return h(iconMap[item.type]);
        };

        const renderCode = () => {
            return props.code?.code.map((item: any) => {
                return (
                    <li onClick={() => props.onChangeCurrentCodeItem(item)} class={['letgo-comp-code__item', props.currentCodeItem?.id === item.id ? 'letgo-comp-code__item--active' : '']}>
                        {renderCodeIcon(item)}
                        <CodeId id={item.id} hasCodeId={props.hasCodeId} onChange={changeCodeId} />
                        <FDropdown onClick={value => onCommonAction(value, item)} appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                            <MoreOutlined class="letgo-comp-code__icon-more" />
                        </FDropdown>
                    </li>
                );
            });
        };

        const addCodeItem = (val: string) => {
            const option = options.find(item => item.value === val);
            if (option.codeType)
                props.code?.addCodeItemWithType(option.codeType, val as ResourceType);
            else
                props.code?.addCodeItemWithType(val as CodeType);
        };

        return () => {
            return (
                <div class="letgo-comp-code">
                    <div class="letgo-comp-code__header">
                        <FDropdown trigger="click" onClick={addCodeItem} placement="bottom-start" options={options}>
                            <PlusOutlined class="letgo-comp-code__header-icon" />
                        </FDropdown>
                    </div>
                    <ul class="letgo-comp-code__body">
                        {renderFolders()}
                        {renderCode()}
                    </ul>
                </div>
            );
        };
    },
});
