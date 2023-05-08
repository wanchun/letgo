import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../constants';

import type { CodeItem } from '../interface';
import { codeCls, codeHeaderCls, codeItemActiveCls, codeItemCls, codeItemIdCls, codeWrapCls, headerIconCls } from './code.css';

import CodeId from './code-id';
import FolderIcon from './folder-icon';
import StateIcon from './state-icon';
import JsIcon from './js-icon';
import ComputedIcon from './computed-icon';
import MoreIcon from './more-icon';
import useCode from './useCode';

const iconMap = {
    [JAVASCRIPT_QUERY]: JsIcon,
    [JAVASCRIPT_COMPUTED]: ComputedIcon,
    [TEMPORARY_STATE]: StateIcon,
};

// TODO 拖拽交换 code 顺序
export default defineComponent({
    setup() {
        const options = [
            {
                value: JAVASCRIPT_QUERY,
                label: 'Javascript query',
                icon: () => h(iconMap[JAVASCRIPT_QUERY]),
            },
            {
                value: JAVASCRIPT_COMPUTED,
                label: 'Javascript computed',
                icon: () => h(iconMap[JAVASCRIPT_COMPUTED]),
            },
            {
                value: TEMPORARY_STATE,
                label: 'Temporary state',
                icon: () => h(iconMap[TEMPORARY_STATE]),
            },
            // {
            //     value: '4',
            //     label: '目录',
            //     icon: () => h(FolderIcon),
            // },
        ];

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

        const {
            code,
            changeCodeId,
            addCodeItem,
            deleteCodeItem,
            currentCodeItem,
            changeCurrentCodeItem,
        } = useCode();

        const onCommonAction = (value: string, item: CodeItem) => {
            if (value === 'delete')
                deleteCodeItem(item.id);
        };

        const renderFolders = () => {
            return code.directories.map((item) => {
                return <li class={codeItemCls}>
                        <FolderIcon />
                        <span class={codeItemIdCls}>{item.name}</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>;
            });
        };

        const renderCodeIcon = (item: CodeItem) => {
            if (iconMap[item.type])
                return h(iconMap[item.type]);
        };
        const renderCode = () => {
            return code.code.map((item) => {
                return <li onClick={() => changeCurrentCodeItem(item)} class={[codeItemCls, currentCodeItem.value?.id === item.id ? codeItemActiveCls : '']}>
                    {renderCodeIcon(item)}
                    <CodeId id={item.id} onChange={changeCodeId} />
                    <FDropdown onClick={value => onCommonAction(value, item)} appendToContainer={false} trigger="click" placement="bottom-end" options={commonOptions}>
                        <MoreIcon />
                    </FDropdown>
                </li>;
            });
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