import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import Content from './content';
import Panel from './panel';

export default {
    name: 'PluginCodePanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            name: 'CodePanel',
            area: 'leftArea',
            type: 'WidgetPanel',
            content: () => <Content />,
            props: {
                align: 'bottom',
            },
            panelContent: () => <Panel editor={editor} designer={designer} />,
            panelProps: {
                width: 300,
                title: 'code',
            },
        });
    },
} as IPluginConfig;
