import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import PluginDesignerView from './designer';

export default {
    name: 'PluginDesigner',
    init(ctx) {
        ctx.skeleton.add({
            name: 'pluginDesignerPanel',
            area: 'mainArea',
            type: 'Widget',
            content: () => <PluginDesignerView ctx={ctx} />,
        });
    },
} as IPluginConfig;
