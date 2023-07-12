import type { IPluginConfig } from '@fesjs/letgo-engine';
import Logo from '../../components/logo.vue';

export default {
    name: 'PluginLogo',
    init({ skeleton }) {
        skeleton.add({
            name: 'PluginLogoSkeleton',
            area: 'topArea',
            type: 'Widget',
            render: () => <Logo />,
            props: {
                align: 'left',
            },
        });
    },
} as IPluginConfig;
