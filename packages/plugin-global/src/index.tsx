import type { IPluginConfig } from '@webank/letgo-engine-plugin';
import GlobalActions from './global-actions';

export default {
    name: 'PluginGlobal',
    init({ skeleton }) {
        skeleton.add({
            name: 'globalConfig',
            area: 'topArea',
            type: 'Widget',
            render: () => <GlobalActions />,
            props: {
                align: 'right',
            },
        });
    },
} as IPluginConfig;
