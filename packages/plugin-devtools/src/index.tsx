import { definePlugin } from '@webank/letgo-engine-plugin';
import type { TabPanel } from '@webank/letgo-editor-skeleton';

let panel: TabPanel;

export default definePlugin({
    name: 'PluginDevtools',
    init({ skeleton }) {
        panel = skeleton.add({
            type: 'TabPanel',
            area: 'bottomArea',
            name: 'PluginDevtoolsPanel',
            render: () => <div>111</div>,
            renderHeader: () => '日志',
            props: {
                align: 'left',
                height: 200,
            },
        });
    },
    destroy({ skeleton }) {
        skeleton.remove(panel?.config);
        panel = undefined;
    },
});
