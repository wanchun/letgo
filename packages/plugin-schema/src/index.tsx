import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import { More } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import { SchemaView } from './schema';
import './index.less';

let widget: Widget | undefined;
let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginSchema',
    init({ skeleton, config, designer }) {
        const requireConfig = config.get('requireConfig');
        panel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginSchemaPanel',
            render: () => <SchemaView requireConfig={requireConfig} designer={designer} />,
            props: {
                width: 'calc(100% - 48px)',
                title: 'Schema',
            },
        });
        widget = skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginSchemaWidget',
            props: {
                align: 'bottom',
            },
            render: () => <FTooltip content="Schema" placement="right"><More theme="outline" class="letgo-plg-schema__icon" /></FTooltip>,
        }).link(
            panel,
        );
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        skeleton.remove(panel?.config);
        widget = undefined;
        panel = undefined;
    },
});
