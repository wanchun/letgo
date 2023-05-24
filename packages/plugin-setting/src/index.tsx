import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import PluginSettingView from './setting';

export default {
    name: 'PluginSetting',
    init(ctx) {
        const setterPanel = ctx.skeleton.add({
            name: 'setterPanel',
            area: 'rightArea',
            type: 'Panel',
            content: () => <PluginSettingView ctx={ctx} />,
        });
        setterPanel.show();
    },
} as IPluginConfig;
