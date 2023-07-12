import type { IPluginConfig } from '@harrywan/letgo-engine-plugin';
import PluginSettingView from './setting';

export default {
    name: 'PluginSetting',
    init(ctx) {
        const setterPanel = ctx.skeleton.add({
            name: 'setterPanel',
            area: 'rightArea',
            type: 'Panel',
            render: () => <PluginSettingView ctx={ctx} />,
        });
        setterPanel.show();
    },
} as IPluginConfig;
