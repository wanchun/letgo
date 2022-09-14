import { IPluginConfig, IPluginContext } from '@webank/letgo-engine';
import Content from './content';

export default {
    name: 'PluginDesigner',
    init(pluginCtx: IPluginContext) {
        pluginCtx.skeleton.add({
            name: 'ComponentsPanel',
            area: 'mainArea',
            type: 'Widget',
            content: () => <Content ctx={pluginCtx} />,
        });
    },
} as IPluginConfig;
