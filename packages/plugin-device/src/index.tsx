import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import { DeviceView } from './device';

export default {
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
} as IPluginConfig;
