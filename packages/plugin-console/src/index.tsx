import { definePlugin } from '@webank/letgo-engine-plugin';
import type { TabPanel } from '@webank/letgo-editor-skeleton';
import ConsoleTitle from './components/console-title';
import ConsolePane from './pane';

let panel: TabPanel;

export default definePlugin({
    name: 'PluginDevtools',
    init({ skeleton }) {
        panel = skeleton.add({
            type: 'TabPanel',
            area: 'bottomArea',
            name: 'PluginDevtoolsPanel',
            render: () => <ConsolePane />,
            renderHeader: () => <ConsoleTitle />,
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
