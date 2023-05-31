import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import PluginDesignerView from './designer';

export default {
    name: 'PluginDesigner',
    init(ctx) {
        ctx.skeleton.add({
            name: 'pluginDesignerWidget',
            area: 'mainArea',
            type: 'Widget',
            render: () => <PluginDesignerView ctx={ctx} />,
        });
    },
} as IPluginConfig;
