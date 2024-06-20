import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Widget } from '@webank/letgo-editor-skeleton';
import { DeviceView } from './device';

let widget: Widget | undefined;

export default definePlugin({
    name: 'PluginDevice',
    init(ctx) {
        widget = ctx.skeleton.add({
            area: 'topArea',
            name: 'deviceWidget',
            type: 'Widget',
            props: {
                description: '切换画布尺寸',
                align: 'center',
            },
            render: () => <DeviceView designer={ctx.designer} />,
        });
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        widget = undefined;
    },
});
