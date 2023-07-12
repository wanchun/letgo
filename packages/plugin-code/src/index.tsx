import type { IPluginConfig } from '@harrywan/letgo-engine-plugin';
import { Code } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import Panel from './panel';
import { iconCls } from './icon.css';

export default {
    name: 'PluginCodePanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            name: 'CodeWidget',
            type: 'Widget',
            render: () => <FTooltip content="逻辑编排" placement="right"><Code theme="outline" size={20} class={iconCls} /></FTooltip>,
        }).link(
            skeleton.add({
                type: 'Panel',
                name: 'CodePanel',
                area: 'leftFloatArea',
                render: () => <Panel editor={editor} designer={designer} />,
                props: {
                    width: 720,
                    title: '逻辑编排',
                },
            }),
        );
    },
} as IPluginConfig;
