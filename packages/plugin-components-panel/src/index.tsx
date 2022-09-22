import { IPluginConfig } from '@webank/letgo-engine';
import Content from './content.vue';
import Panel from './panel.vue';

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
