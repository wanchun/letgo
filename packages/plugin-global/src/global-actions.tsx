import type { PropType } from 'vue';
import { defineComponent, reactive } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined } from '@fesjs/fes-design/icon';
import type { Designer } from '@fesjs/letgo-designer';
import { iconCls } from './global-actions.css';
import { GlobalCSS } from './global-css';
import { GlobalCode } from './global-code/code';

export default defineComponent({
    name: 'GlobalActions',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const options = [{
            label: '全局样式配置',
            value: 'globalCss',
        }, {
            label: '全局状态',
            value: 'globalCode',
        }];

        const setting = reactive({
            globalCss: false,
            globalCode: false,
        });
        const selectConfig = (value: string) => {
            if (['globalCss', 'globalCode'].includes(value))
                setting[value as keyof typeof setting] = true;
        };

        return () => {
            return <>
                <FDropdown onClick={selectConfig} trigger='click' options={options}>
                    <MoreOutlined class={iconCls} />
                </FDropdown>
                <GlobalCSS project={props.designer.project} v-model={setting.globalCss} />
                <GlobalCode designer={props.designer} v-model={setting.globalCode} />
            </>;
        };
    },
});
