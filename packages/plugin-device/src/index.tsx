import type { IPluginConfig } from '@harrywan/letgo-engine-plugin';
import { DeviceView } from './device';

export default {
    name: 'PluginDevice',
    init(ctx) {
        ctx.skeleton.add({
            area: 'toolbarArea',
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
