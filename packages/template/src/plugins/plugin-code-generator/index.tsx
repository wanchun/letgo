import { definePlugin } from '@webank/letgo-engine';
import ExportBtn from './export-btn';

export default definePlugin({
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
    destroy({ skeleton }) {
        skeleton.remove({
            name: 'exportCodeButton',
            area: 'topArea',
        });
    },
});
