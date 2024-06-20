import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel } from '@webank/letgo-editor-skeleton';
import PluginSettingView from './setting';

let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginSetting',
    init(ctx) {
        panel = ctx.skeleton.add({
            name: 'setterPanel',
            area: 'rightArea',
            type: 'Panel',
            render: () => <PluginSettingView ctx={ctx} />,
        });
        panel.show();
    },
    destroy({ skeleton }) {
        skeleton.remove(panel?.config);
        panel = undefined;
    },
});
