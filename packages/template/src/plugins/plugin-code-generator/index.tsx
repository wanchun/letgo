import { definePlugin } from '@webank/letgo-engine';
import ExportBtn from './export-btn';

export default definePlugin({
    name: 'PluginCodeGenerator',
    meta: {
        logToConsole: true,
    },
    init({ skeleton, logger }) {
        skeleton.add({
            name: 'exportCodeButton',
            area: 'topArea',
            type: 'Widget',
            render: () => <ExportBtn logger={logger} />,
            props: {
                align: 'right',
            },
        });
    },
    destroy({ skeleton }) {
        skeleton.remove({
            name: 'exportCodeButton',
            area: 'topArea',
        });
    },
});
