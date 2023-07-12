import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import type { Code } from '@fesjs/letgo-designer';
import { CodeType, ResourceType } from '@fesjs/letgo-types';
import type { CodeItem } from '@fesjs/letgo-types';
import { ComputedIcon, FolderIcon, JsIcon, RestIcon, StateIcon } from '../icons';

import { codeCls, codeHeaderCls, codeItemActiveCls, codeItemCls, codeItemIdCls, codeMoreIconCls, codeWrapCls, headerIconCls } from './code.css';

import CodeId from './code-id';

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
        code: Object as PropType<Code>,
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
            // props.hasQuery && {
            //     value: ResourceType.RESTQuery,
            //     label: 'REST接口',
            //     codeType: CodeType.JAVASCRIPT_QUERY,
            //     icon: () => h(resourceTypeIcon[ResourceType.RESTQuery]),
            // },
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
                label: '计算状态',
                icon: () => h(iconMap[CodeType.JAVASCRIPT_COMPUTED]),
            },
            {
                value: CodeType.TEMPORARY_STATE,
                label: '临时状态',
                icon: () => h(iconMap[CodeType.TEMPORARY_STATE]),
            },
            // {
            //     value: '4',
            //     label: '目录',
            //     icon: () => h(FolderIcon),
            // },
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
            return props.code?.directories.map((item) => {
                return <li class={codeItemCls}>
                        <FolderIcon />
                        <span class={codeItemIdCls}>{item.name}</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                            <MoreOutlined class={codeMoreIconCls} />
                        </FDropdown>
                    </li>;
            });
        };

        const renderCodeIcon = (item: CodeItem) => {
            if (item.type === CodeType.JAVASCRIPT_QUERY)
                return h(resourceTypeIcon[item.resourceType]);

            if (iconMap[item.type])
                return h(iconMap[item.type]);
        };
        const renderCode = () => {
            return props.code?.code.map((item) => {
                return <li onClick={() => props.onChangeCurrentCodeItem(item)} class={[codeItemCls, props.currentCodeItem?.id === item.id ? codeItemActiveCls : '']}>
                    {renderCodeIcon(item)}
                    <CodeId id={item.id} hasCodeId={props.hasCodeId} onChange={changeCodeId} />
                    <FDropdown onClick={value => onCommonAction(value, item)} appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                        <MoreOutlined class={codeMoreIconCls} />
                    </FDropdown>
                </li>;
            });
        };

        const addCodeItem = (val: string) => {
            const option = options.find(item => item.value === val);
            if (option.codeType)
                props.code?.addCodeItem(option.codeType, val as ResourceType);
            else
                props.code?.addCodeItem(val as CodeType);
        };

        return () => {
            return <div class={codeCls}>
                <div class={codeHeaderCls}>
                    <FDropdown trigger="click" onClick={addCodeItem} placement="bottom-start" options={options}>
                        <PlusOutlined class={headerIconCls} />
                    </FDropdown>
                </div>
                <ul class={codeWrapCls}>
                    {renderFolders()}
                    {renderCode()}
                </ul>
            </div>;
        };
    },
});
