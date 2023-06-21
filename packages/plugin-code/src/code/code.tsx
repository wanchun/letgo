import { computed, defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import type { Designer } from '@webank/letgo-designer';
import { type CodeItem } from '@webank/letgo-types';
import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../constants';

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
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const options = [
            {
                value: JAVASCRIPT_QUERY,
                label: '逻辑',
                icon: () => h(iconMap[JAVASCRIPT_QUERY]),
            },
            {
                value: JAVASCRIPT_COMPUTED,
                label: '计算状态',
                icon: () => h(iconMap[JAVASCRIPT_COMPUTED]),
            },
            {
                value: TEMPORARY_STATE,
                label: '临时状态',
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

        const currentDocument = computed(() => {
            return props.designer.currentDocument;
        });
        const code = computed(() => {
            return currentDocument.value?.code;
        });
        const codesInstance = computed(() => {
            return currentDocument.value?.state.codesInstance;
        });

        const {
            currentCodeItem,
            changeCurrentCodeItem,
        } = useCode();

        const onCommonAction = (value: string, item: CodeItem) => {
            if (value === 'delete') {
                code.value?.deleteCodeItem(item.id);
                if (currentCodeItem.value?.id === item.id)
                    changeCurrentCodeItem(null);
            }
        };

        const changeCodeId = (id: string, preId: string) => {
            code.value?.changeCodeId(id, preId);
            if (codesInstance.value) {
                Object.keys(codesInstance.value).forEach((currentId) => {
                    if (codesInstance.value[currentId].deps.includes(preId))
                        code.value.scopeVariableChange(currentId, id, preId);
                });
            }
        };

        const renderFolders = () => {
            return code.value?.directories.map((item) => {
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
            return code.value?.code.map((item) => {
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
                    <FDropdown trigger="click" onClick={code.value?.addCodeItem} placement="bottom-start" options={options}>
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
