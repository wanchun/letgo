import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import Content from './content';
import Panel from './panel';

export default {
    name: 'PluginComponents',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginComponentsWidget',
            render: () => <Content />,
        }).concat(
            skeleton.add({
                type: 'Panel',
                area: 'leftFloatArea',
                name: 'PluginComponentsPanel',
                render: () => <Panel editor={editor} designer={designer} />,
                props: {
                    width: 300,
                    title: '组件库',
                },
            }),
        );
    },
} as IPluginConfig;
