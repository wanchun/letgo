import type { IPluginConfig } from '@webank/letgo-engine';
import ExportBtn from './export-btn';

export default {
    name: 'PluginCodeGenerator',
    init({ skeleton }) {
        skeleton.add({
            name: 'exportCodeButton',
            area: 'topArea',
            type: 'Widget',
            render: () => <ExportBtn />,
            props: {
                align: 'right',
            },
        });
    },
} as IPluginConfig;
