import type { IPluginConfig } from '@harrywan/letgo-engine-plugin';
import { More } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import { SchemaView } from './schema';
import "./index.less"

export default {
    name: 'PluginSchema',
    init({ skeleton, designer }) {
        skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginSchemaWidget',
            props: {
                align: 'bottom',
            },
            render: () => <FTooltip content="Schema" placement="right"><More theme="outline" class="letgo-plg-schema__icon" /></FTooltip>,
        }).link(
            skeleton.add({
                type: 'Panel',
                area: 'leftFloatArea',
                name: 'PluginSchemaPanel',
                render: () => <SchemaView designer={designer} />,
                props: {
                    width: 'calc(100% - 48px)',
                    title: 'Schema',
                },
            }),
        );
    },
} as IPluginConfig;
