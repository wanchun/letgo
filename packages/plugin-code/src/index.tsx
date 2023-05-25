import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import { Code } from '@icon-park/vue-next';
import Panel from './panel';
import { iconCls } from './icon.css';

export default {
    name: 'PluginCodePanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            name: 'CodePanel',
            area: 'leftArea',
            type: 'WidgetPanel',
            content: () => <Code theme="outline" size={20} strokeWidth={2} class={iconCls} />,
            props: {
                align: 'top',
            },
            panelContent: () => <Panel editor={editor} designer={designer} />,
            panelProps: {
                width: 720,
                title: 'code',
            },
        });
    },
} as IPluginConfig;
