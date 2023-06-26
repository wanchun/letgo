import { defineComponent, reactive } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined } from '@fesjs/fes-design/icon';
import { iconCls } from './global-actions.css';
import { GlobalConfig } from './config';
import { GlobalCSS } from './global-css';
import { GlobalJS } from './global-js';

export default defineComponent({
    name: 'GlobalActions',
    setup() {
        const options = [{
            label: '项目配置',
            value: 'config',
        }, {
            label: '全局样式配置',
            value: 'globalCss',
        }, {
            label: '全局脚本配置',
            value: 'globalJs',
        }];

        const setting = reactive({
            config: false,
            globalCss: false,
            globalJs: false,
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
                <GlobalConfig v-model={setting.config} />
                <GlobalCSS v-model={setting.globalCss} />
                <GlobalJS v-model={setting.globalJs} />
            </>;
        };
    },
});
