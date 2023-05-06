import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { codeCls, codeHeaderCls, codeItemCls, codeItemIdCls, codeWrapCls, headerIconCls } from './code.css';

import FolderIcon from './folder-icon';
import StateIcon from './state-icon';
import JsIcon from './js-icon';
import ComputedIcon from './computed-icon';

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
                        <span>C</span>
                    </li>
                    <li class={codeItemCls}>
                        <StateIcon />
                        <span class={codeItemIdCls}>state1</span>
                        <span>C</span>
                    </li>
                    <li class={codeItemCls}>
                        <JsIcon />
                        <span class={codeItemIdCls}>js</span>
                        <span>C</span>
                    </li>
                    <li class={codeItemCls}>
                        <ComputedIcon />
                        <span class={codeItemIdCls}>computed</span>
                        <span>C</span>
                    </li>
                </ul>
            </div>;
        };
    },
});
