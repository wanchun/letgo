import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import type { Code } from '@webank/letgo-designer';
import { CodeType } from '@webank/letgo-types';
import type { CodeItem } from '@webank/letgo-types';
import { ComputedIcon, FolderIcon, JsIcon, StateIcon } from '../icons';

import { codeCls, codeHeaderCls, codeItemActiveCls, codeItemCls, codeItemIdCls, codeMoreIconCls, codeWrapCls, headerIconCls } from './code.css';

import CodeId from './code-id';

const iconMap = {
    [CodeType.JAVASCRIPT_QUERY]: JsIcon,
    [CodeType.JAVASCRIPT_FUNCTION]: JsIcon,
    [CodeType.JAVASCRIPT_COMPUTED]: ComputedIcon,
    [CodeType.TEMPORARY_STATE]: StateIcon,
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
        hasFunction: Boolean,
        onCodeIdChange: Function as PropType<((id: string, preId: string) => void)>,
    },
    setup(props) {
        const options = [
            props.hasQuery && {
                value: CodeType.JAVASCRIPT_QUERY,
                label: '逻辑',
                icon: () => h(iconMap[CodeType.JAVASCRIPT_QUERY]),
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

        return () => {
            return <div class={codeCls}>
                <div class={codeHeaderCls}>
                    <FDropdown trigger="click" onClick={props.code?.addCodeItem} placement="bottom-start" options={options}>
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
