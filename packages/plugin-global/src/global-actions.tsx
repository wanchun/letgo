import type { PropType } from 'vue';
import { defineComponent, reactive } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined } from '@fesjs/fes-design/icon';
import type { Designer } from '@webank/letgo-designer';
import { iconCls } from './global-actions.css';
import { GlobalCSS } from './global-css';

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
        }];

        const setting = reactive({
            globalCss: false,
        });
        const selectConfig = (value: string) => {
            if (['config', 'globalCss', 'globalJs'].includes(value))
                setting[value as keyof typeof setting] = true;
        };

        return () => {
            return <>
                <FDropdown onClick={selectConfig} trigger='click' options={options}>
                    <MoreOutlined class={iconCls} />
                </FDropdown>
                {/* <GlobalConfig v-model={setting.config} /> */}
                <GlobalCSS project={props.designer.project} v-model={setting.globalCss} />
            </>;
        };
    },
});
