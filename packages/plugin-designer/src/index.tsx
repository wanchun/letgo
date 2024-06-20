import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Widget } from '@webank/letgo-editor-skeleton';
import PluginDesignerView from './designer';

let widget: Widget | undefined;

export default definePlugin({
    name: 'PluginDesigner',
    init(ctx) {
        widget = ctx.skeleton.add({
            name: 'pluginDesignerWidget',
            area: 'mainArea',
            type: 'Widget',
            render: () => <PluginDesignerView ctx={ctx} />,
        });
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        widget = undefined;
    },
});
