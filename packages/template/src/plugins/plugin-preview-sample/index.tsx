import { material, project } from '@webank/letgo-engine';
import type { IPluginConfig } from '@webank/letgo-engine';
import { IPublicEnumTransformStage } from '@webank/letgo-types';
import { FButton } from '@fesjs/fes-design';

export default {
    name: 'PluginPreview',
    init({ skeleton }) {
        const doPreview = () => {
            const scenarioName = 'schema_cache';
            window.localStorage.setItem(
                scenarioName,
                JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save)),
            );
            const packages = material.getAssets().packages;
            window.localStorage.setItem(
                `${scenarioName}_packages`,
                JSON.stringify(packages),
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
            render: () => <FButton type="primary" onClick={() => doPreview()}>预览</FButton>,
        });
    },
} as IPluginConfig;
