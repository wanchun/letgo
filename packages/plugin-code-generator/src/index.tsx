import { IPluginConfig } from '@webank/letgo-plugin-manager';
import ExportBtn from './exportBtn';

export default {
    name: 'PluginCodeGenerator',
    init({ skeleton }) {
        skeleton.add({
            name: 'exportCodeButton',
            area: 'topArea',
            type: 'Widget',
            content: () => <ExportBtn />,
            props: {
                align: 'right',
            },
        });
    },
} as IPluginConfig;
