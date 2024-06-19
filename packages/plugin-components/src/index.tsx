import { definePlugin } from '@webank/letgo-engine-plugin';
import Content from './content';
import Panel from './panel';

export default definePlugin({
    name: 'PluginComponents',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginComponentsWidget',
            render: () => <Content />,
        }).link(
            skeleton.add({
                type: 'Panel',
                area: 'leftFloatArea',
                name: 'PluginComponentsPanel',
                render: () => <Panel editor={editor} designer={designer} />,
                props: {
                    width: 300,
                    title: '物料',
                },
                defaultFixed: false,
            }),
        );
    },
    destroy({ skeleton }) {
        skeleton.remove({
            area: 'leftArea',
            name: 'PluginComponentsWidget',
        });
        skeleton.remove({
            area: 'leftFloatArea',
            name: 'PluginComponentsPanel',
        });
    },
});
