import type { IPluginConfig } from '@harrywan/letgo-engine-plugin';
import ExportBtn from './export-btn';
import type { GenCodeOptions } from './common/types';

export * from './common/types';

export default {
    name: 'PluginCodeGenerator',
    init({ skeleton }, option?: GenCodeOptions) {
        skeleton.add({
            name: 'exportCodeButton',
            area: 'topArea',
            type: 'Widget',
            render: () => <ExportBtn option={option} />,
            props: {
                align: 'right',
            },
        });
    },
} as IPluginConfig;
