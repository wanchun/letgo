import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import { FTooltip } from '@fesjs/fes-design';
import { JsEditView } from './jsEdit';
import './index.less';

let widget: Widget | undefined;
let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginLogic',
    init({ config, skeleton, designer }) {
        const requireConfig = config.get('requireConfig');
        panel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginLogicPanel',
            render: () => <JsEditView requireConfig={requireConfig} designer={designer} />,
            props: {
                width: '600',
                title: '源码面板',
                displayDirective: 'lazyShow',
            },
        });
        widget = skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginLogicWidget',
            render: () => (
                <FTooltip content="类逻辑" placement="right">
                    <span class="letgo-plg-logic__icon">
                        <svg viewBox="0 0 1024 1024" version="1.1" p-id="4161" width="1em" height="1em" fill="currentColor">
                            <path d="M707.072 648.448c-15.36 8.704-36.864 13.312-63.488 13.312-30.208 0-52.224-5.632-66.56-15.872-15.872-11.776-25.6-31.744-29.696-59.392h-59.392c2.56 46.592 19.456 80.384 50.176 101.888 25.088 17.408 60.416 26.112 105.472 26.112 46.592 0 82.944-9.728 108.544-28.16 25.6-18.944 38.4-45.056 38.4-77.824 0-33.792-15.872-59.904-47.616-78.848-14.336-8.192-46.08-20.48-95.744-35.84-33.792-10.752-54.784-18.432-62.464-22.528-17.408-9.216-25.6-22.016-25.6-37.376 0-17.408 7.168-30.208 22.528-37.888 12.288-6.656 29.696-9.728 52.736-9.728 26.624 0 47.104 4.608 60.416 14.848 13.312 9.728 23.04 26.112 28.16 48.64h59.392c-3.584-39.936-18.432-69.632-44.032-88.576-24.064-17.92-57.856-26.624-100.864-26.624-39.424 0-71.68 8.704-97.28 26.624-27.648 18.432-40.96 44.032-40.96 76.288s13.824 56.832 41.984 73.728c10.752 6.144 38.912 16.384 83.968 30.72 40.448 12.288 64 20.48 71.168 24.064 22.528 11.264 34.304 26.624 34.304 46.08 0 15.36-8.192 27.136-23.552 36.352z" p-id="4162"></path>
                            <path d="M884.864 223.84L557.984 34.56a101.088 101.088 0 0 0-101.056 0L130.24 223.872a101.12 101.12 0 0 0-50.24 87.2v401.312c0 36.384 19.712 70.016 51.424 87.872l117.792 66.176c1.28 0.704 2.688 0.768 4.032 1.312 15.648 7.616 34.272 11.52 57.472 11.52 42.496 0 75.36-15.52 94.816-37.024 17.408-20.48 26.112-51.2 26.112-93.184V341.76h-59.904v405.248c0 26.112-4.608 45.056-13.824 56.832-9.216 11.776-24.064 17.92-44.032 17.92-2.688 0-18.656-4.096-31.2-9.408l-0.16-0.032c-0.736-0.48-1.184-1.248-1.952-1.664l-117.76-66.176A36.96 36.96 0 0 1 144 712.352v-401.28c0-13.088 7.04-25.28 18.336-31.84l326.656-189.28a36.8 36.8 0 0 1 36.896 0l326.88 189.28c11.328 6.592 18.368 18.784 18.368 31.872V713.6c0 12.864-6.88 24.96-17.92 31.552L537.472 933.824a36.8 36.8 0 0 1-36.896 0.512l-67.168-37.76a32 32 0 1 0-31.392 55.808l67.2 37.76a100.832 100.832 0 0 0 101.056-1.376l315.744-188.672a101.216 101.216 0 0 0 49.088-86.496V311.072a100.992 100.992 0 0 0-50.24-87.232z" p-id="4163"></path>
                        </svg>
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
