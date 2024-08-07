import { definePlugin } from '@webank/letgo-engine';

export default definePlugin({
    name: 'PluginBottom',
    init({ skeleton }) {
        skeleton.add({
            name: 'PluginTestSkeleton',
            area: 'bottomArea',
            type: 'TabPanel',
            props: {
                align: 'left',
                height: 200,
            },
            render: () => <div>111</div>,
            renderHeader: () => '日志',
        });
    },
    destroy({ skeleton }) {
        skeleton.remove({
            name: 'PluginTestSkeleton',
            area: 'bottomArea',
        });
    },
});
