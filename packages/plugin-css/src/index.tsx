import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import { FTooltip } from '@fesjs/fes-design';
import { CSSView } from './css';
import './index.less';

let widget: Widget | undefined;
let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginCSS',
    init({ skeleton, config, designer }) {
        const requireConfig = config.get('requireConfig');
        panel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginCSSPanel',
            render: () => <CSSView requireConfig={requireConfig} designer={designer} />,
            props: {
                width: '600',
                title: '全局样式',
                displayDirective: 'lazyShow',
            },
        });
        widget = skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginCSSWidget',
            render: () => (
                <FTooltip content="全局样式" placement="right">
                    <span class="letgo-plg-schema__icon">
                        <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M725.333333 85.333333l213.333334 213.333334v170.666666h-85.333334v-135.253333L689.92 170.666667H170.666667v298.666666H85.333333V85.333333zM256 768v42.666667a42.666667 42.666667 0 0 1-85.333333 0v-170.666667a42.666667 42.666667 0 0 1 85.333333 0v42.666667h85.333333v-42.666667a128 128 0 0 0-256 0v170.666667a128 128 0 0 0 256 0v-42.666667z m256-85.333333a42.666667 42.666667 0 1 1 42.666667-42.666667h85.333333a128 128 0 1 0-128 128 42.666667 42.666667 0 1 1-42.666667 42.666667h-85.333333a128 128 0 1 0 128-128z m298.666667 0a42.666667 42.666667 0 1 1 42.666666-42.666667h85.333334a128 128 0 1 0-128 128 42.666667 42.666667 0 1 1-42.666667 42.666667h-85.333333a128 128 0 1 0 128-128z"></path></svg>
                    </span>
                </FTooltip>
            ),
        }).link(panel);
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        skeleton.remove(panel?.config);
        widget = undefined;
        panel = undefined;
    },
});
