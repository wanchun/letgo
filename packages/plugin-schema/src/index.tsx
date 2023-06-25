import type { IPluginConfig } from '@webank/letgo-engine-plugin';
import { More } from '@icon-park/vue-next';
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
            render: () => <More theme="outline"  class={iconCls} />,
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
