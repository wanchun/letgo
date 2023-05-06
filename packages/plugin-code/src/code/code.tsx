import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { codeCls, codeHeaderCls, codeItemCls, codeItemIdCls, codeWrapCls, headerIconCls } from './code.css';

import FolderIcon from './folder-icon';
import StateIcon from './state-icon';
import JsIcon from './js-icon';
import ComputedIcon from './computed-icon';
import MoreIcon from './more-icon';

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
                    <li class={codeItemCls}>
                        <StateIcon />
                        <span class={codeItemIdCls}>state1</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                    <li class={codeItemCls}>
                        <JsIcon />
                        <span class={codeItemIdCls}>js</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                    <li class={codeItemCls}>
                        <ComputedIcon />
                        <span class={codeItemIdCls}>computed</span>
                        <FDropdown appendToContainer={false} trigger="click" placement="bottom-end" options={commonActions}>
                            <MoreIcon />
                        </FDropdown>
                    </li>
                </ul>
            </div>;
        };
    },
});
