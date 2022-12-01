import { IPluginConfig } from '@webank/letgo-plugin-manager';
import Content from './content';
import Panel from './panel';

export default {
    name: 'PluginComponentsPanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            name: 'ComponentsPanel',
            area: 'leftArea',
            type: 'WidgetPanel',
            content: () => <Content />,
            props: {
                align: 'top',
            },
            panelContent: () => <Panel editor={editor} designer={designer} />,
            panelProps: {
                width: 500,
                title: '组件库',
            },
        });
    },
} as IPluginConfig;
