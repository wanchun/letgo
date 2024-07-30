import { definePlugin } from '@webank/letgo-engine-plugin';
import type { TabPanel } from '@webank/letgo-editor-skeleton';
import ConsoleTitle from './components/console-title';
import ConsolePane from './pane';

let panel: TabPanel;

/**
 * TODO
 * 1. 如果日志输出时间比本插件早，那么日志会被静默
 */
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
