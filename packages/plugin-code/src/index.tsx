import type { IPluginConfig } from '@webank/letgo-engine-plugin';
import { Code } from '@icon-park/vue-next';
import Panel from './panel';
import { iconCls } from './icon.css';

export default {
    name: 'PluginCodePanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            name: 'CodeWidget',
            type: 'Widget',
            render: () => <Code theme="outline" size={20} strokeWidth={2} class={iconCls} />,
        }).link(
            skeleton.add({
                type: 'Panel',
                name: 'CodePanel',
                area: 'leftFloatArea',
                render: () => <Panel editor={editor} designer={designer} />,
                props: {
                    width: 720,
                    title: 'code',
                },
            }),
        );
    },
} as IPluginConfig;
