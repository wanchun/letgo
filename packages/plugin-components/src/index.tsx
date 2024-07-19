import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import Content from './content';
import PanelView from './panel';

let widget: Widget | undefined;
let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginComponents',
    init({ skeleton, editor, designer }) {
        panel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginComponentsPanel',
            render: () => <PanelView editor={editor} designer={designer} />,
            props: {
                width: 266,
                title: '物料',
            },
            defaultFixed: false,
        });
        widget = skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginComponentsWidget',
            render: () => <Content />,
        }).link(panel);
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        skeleton.remove(panel?.config);
        widget = undefined;
        panel = undefined;
    },
});
