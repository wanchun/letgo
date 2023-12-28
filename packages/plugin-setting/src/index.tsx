import { definePlugin } from '@webank/letgo-engine-plugin';
import PluginSettingView from './setting';

export default definePlugin({
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
});
