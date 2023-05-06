import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { codeCls, codeHeaderCls, codeItemActiveCls, codeItemCls, codeItemIdCls, codeWrapCls, headerIconCls } from './code.css';

import CodeId from './code-id';
import FolderIcon from './folder-icon';
import StateIcon from './state-icon';
import JsIcon from './js-icon';
import ComputedIcon from './computed-icon';
import MoreIcon from './more-icon';

// TODO 拖拽交换 code 顺序
export default defineComponent({
    setup() {
        const options = [
            {
                value: '1',
                label: 'Javascript query',
                icon: () => h(JsIcon),
            },
            {
                value: '2',
                label: 'Javascript computed',
                icon: () => h(ComputedIcon),
            },
            {
                value: '3',
                label: 'Temporary state',
                icon: () => h(StateIcon),
            },
            {
                value: '4',
                label: '目录',
                icon: () => h(FolderIcon),
            },
        ];

        const commonActions = [
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

        return () => {
            return <div class={codeCls}>
                <div class={codeHeaderCls}>
                    <FDropdown trigger="click" placement="bottom-start" options={options}>
                        <PlusOutlined class={headerIconCls} />
                    </FDropdown>
                </div>
                <ul class={codeWrapCls}>
                    <li class={codeItemCls}>
                        <FolderIcon />
                        <span class={codeItemIdCls}>folder</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                    <li class={[codeItemCls, codeItemActiveCls]}>
                        <StateIcon />
                        <CodeId id="state1" />
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                    <li class={codeItemCls}>
                        <JsIcon />
                        <CodeId id="js" />
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                    <li class={codeItemCls}>
                        <ComputedIcon />
                        <CodeId id="computed" />
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                </ul>
            </div>;
        };
    },
});
