import { definePlugin } from '@webank/letgo-engine-plugin';
import { DeviceView } from './device';

export default definePlugin({
    name: 'PluginDevice',
    init(ctx) {
        ctx.skeleton.add({
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
        skeleton.remove({
            area: 'topArea',
            name: 'deviceWidget',
        });
    },
});
