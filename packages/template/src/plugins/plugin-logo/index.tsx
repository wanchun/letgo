import { definePlugin } from '@webank/letgo-engine';
import Logo from '../../components/logo.vue';

export default definePlugin({
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
    destroy({ skeleton }) {
        skeleton.remove({
            name: 'PluginLogoSkeleton',
            area: 'topArea',
        });
    },
});
