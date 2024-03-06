import { definePlugin } from '@webank/letgo-engine-plugin';
import { FTooltip } from '@fesjs/fes-design';
import Panel from './panel';

export * from './common/register';

export default definePlugin({
    name: 'PluginCodePanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            name: 'CodeWidget',
            type: 'Widget',
            render: () => (
                <FTooltip content="逻辑" placement="right">
                    <span class="letgo-plg-code__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <g fill="none">
                                <path d="M0 0h24v24H0z" />
                                <path fill="currentColor" d="M14.486 3.143a1 1 0 0 1 .692 1.233l-4.43 15.788a1 1 0 0 1-1.926-.54l4.43-15.788a1 1 0 0 1 1.234-.693M7.207 7.05a1 1 0 0 1 0 1.414L3.672 12l3.535 3.535a1 1 0 1 1-1.414 1.415L1.55 12.707a1 1 0 0 1 0-1.414L5.793 7.05a1 1 0 0 1 1.414 0m9.586 1.414a1 1 0 1 1 1.414-1.414l4.243 4.243a1 1 0 0 1 0 1.414l-4.243 4.243a1 1 0 0 1-1.414-1.415L20.328 12z" />
                            </g>
                        </svg>
                    </span>
                </FTooltip>
            ),
        }).link(
            skeleton.add({
                type: 'Panel',
                name: 'CodePanel',
                area: 'leftFloatArea',
                render: () => <Panel editor={editor} designer={designer} />,
                props: {
                    width: 300,
                    title: '逻辑',
                },
                defaultFixed: false,
            }),
        );
    },
});
