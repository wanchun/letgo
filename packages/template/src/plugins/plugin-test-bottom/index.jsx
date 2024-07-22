import { IPublicEnumTransformStage, definePlugin, project } from '@webank/letgo-engine';
import { FTooltip } from '@fesjs/fes-design';
import { EyeOutlined } from '@fesjs/fes-design/icon';
import { render } from 'vue';

export default definePlugin({
    name: 'PluginBottom',
    init({ skeleton }) {
        skeleton.add({
            name: 'PluginTestSkeleton',
            area: 'bottomArea',
            type: 'TabPanel',
            props: {
                align: 'left',
                height: 200,
            },
            render: () => <div>111</div>,
            renderHeader: () => '日志',
        });
    },
});
