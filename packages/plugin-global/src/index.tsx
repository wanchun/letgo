import { FTooltip } from '@fesjs/fes-design';
import type { IPluginConfig } from '@webank/letgo-engine-plugin';
import GlobalActions from './global-actions';
import Panel from './panel';

// 本插件后续废弃，将逻辑放到一个插件里面
export default {
    name: 'PluginGlobal',
    init({ skeleton, designer }) {
        skeleton.add({
            name: 'globalConfig',
            area: 'leftArea',
            type: 'Widget',
            render: () => (
                <FTooltip content="全局逻辑" placement="right">
                    <GlobalActions designer={designer} />
                </FTooltip>
            ),
            props: {
                align: 'right',
            },
        }).link(
            skeleton.add({
                type: 'Panel',
                name: 'globalConfigPanel',
                area: 'leftFloatArea',
                render: () => <Panel designer={designer} />,
                props: {
                    width: 720,
                    title: '全局逻辑',
                },
            }),
        );
    },
} as IPluginConfig;
