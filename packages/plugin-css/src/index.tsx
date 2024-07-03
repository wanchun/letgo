import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import { Optimize } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import { CSSView } from './css';
import './index.less';

let widget: Widget | undefined;
let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginCSS',
    init({ skeleton, designer }) {
        panel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginCSSPanel',
            render: () => <CSSView designer={designer} />,
            props: {
                width: '600',
                title: '全局样式',
                displayDirective: 'show',
            },
        });
        widget = skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginCSSWidget',
            render: () => <FTooltip content="全局样式" placement="right"><Optimize theme="outline" class="letgo-plg-schema__icon" /></FTooltip>,
        }).link(panel);
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        skeleton.remove(panel?.config);
        widget = undefined;
        panel = undefined;
    },
});
