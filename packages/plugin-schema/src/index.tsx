import type { IPluginConfig } from '@fesjs/letgo-engine-plugin';
import { More } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import { iconCls } from './index.css';
import { SchemaView } from './schema';

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
            render: () => <FTooltip content="Schema" placement="right"><More theme="outline" class={iconCls} /></FTooltip>,
        }).link(
            skeleton.add({
                type: 'Panel',
                area: 'leftFloatArea',
                name: 'PluginSchemaPanel',
                render: () => <SchemaView designer={designer} />,
                props: {
                    width: 800,
                    title: 'Schema',
                },
            }),
        );
    },
} as IPluginConfig;
