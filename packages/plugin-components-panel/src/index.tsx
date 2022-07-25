import { IPluginConfig } from '@webank/letgo-engine';
import Content from './content.vue';
import Panel from './panel.vue';

export default {
    name: 'PluginComponentsPanel',
    init({ skeleton, editor }) {
        skeleton.add({
            name: 'ComponentsPanel',
            area: 'leftArea',
            type: 'WidgetPanel',
            content: () => <Content />,
            props: {
                align: 'top',
            },
            panelContent: () => <Panel editor={editor} />,
            panelProps: {
                width: '500px',
                title: '组件库',
            },
        });
    },
} as IPluginConfig;
