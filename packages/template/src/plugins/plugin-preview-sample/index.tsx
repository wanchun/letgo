import { definePlugin, project } from '@webank/letgo-engine';
import { IPublicEnumTransformStage } from '@webank/letgo-types';
import { FTooltip } from '@fesjs/fes-design';
import { EyeOutlined } from '@fesjs/fes-design/icon';

export default definePlugin({
    name: 'PluginPreview',
    init({ skeleton }) {
        const doPreview = () => {
            const scenarioName = 'schema_cache';
            window.localStorage.setItem(
                scenarioName,
                JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save)),
            );
            setTimeout(() => {
                const search = location.search ? `${location.search}&scenarioName=${scenarioName}` : `?scenarioName=${scenarioName}`;
                window.open(`./${search}#/preview`);
            }, 500);
        };

        skeleton.add({
            name: 'PluginPreviewSkeleton',
            area: 'topArea',
            type: 'Widget',
            props: {
                align: 'right',
            },
            render: () => <FTooltip content="预览" placement="top"><EyeOutlined size={20} onClick={() => doPreview()}></EyeOutlined></FTooltip>,
        });
    },
});
