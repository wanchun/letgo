import { defineComponent } from 'vue';
import { material, project } from '@webank/letgo-engine';
import type { IPublicTypePackage } from '@webank/letgo-types';
import {
    ImportType,
    exportZip,
    gen,
} from '@webank/letgo-code-generator';
import { IPublicEnumTransformStage, isProCodeComponentType, isRestQueryResource } from '@webank/letgo-types';
import { getIconSprite } from '@webank/letgo-common';
import { FButton, FMessage } from '@fesjs/fes-design';
import { DownloadOutlined } from '@fesjs/fes-design/icon';
import { forEach, isNil, isObject, isString, merge } from 'lodash-es';
import Mustache from 'mustache';
import codeTemplate from './template';

interface Template {
    [key: string]: string | Template
}

function transform(codeTemplate: Template, params?: Record<string, any>) {
    return forEach(codeTemplate, (value, key) => {
        if (isString(value))
            codeTemplate[key] = Mustache.render(value, params);

        else if (isObject(value))
            transform(value, params); // 递归遍历嵌套对象
    });
}

export default defineComponent({
    setup() {
        const handleGenCode = async () => {
            const packages = material.getAssets().packages;
            const schema = project.exportSchema(IPublicEnumTransformStage.Save);
            const usedPackages: IPublicTypePackage[] = [];
            for (const component of schema.componentsMap) {
                if (isProCodeComponentType(component)) {
                    const pkg = packages.find(
                        pkg =>
                            pkg.package === component.package
                            && pkg.version === component.version,
                    );
                    if (!pkg) {
                        FMessage.error('组件版本匹配异常，请联系开发处理');
                        return;
                    }
                    usedPackages.push(pkg);
                }
            }
            schema.packages = usedPackages;

            const fileTree = gen({
                schema,
                pageTransform: (filesStruct) => {
                    return filesStruct.map((item) => {
                        item.importSources.unshift({
                            imported: 'defineRouteMeta',
                            type: ImportType.ImportSpecifier,
                            source: '@fesjs/fes',
                        });
                        item.afterImports.push(`defineRouteMeta({
                            name: '${item.routeName}',
                            title: '${item.pageTitle}',
                        })`);
                        return item;
                    });
                },
                extraPackageJSON: {
                    scripts: {
                        'build:test': 'FES_ENV=test fes build',
                        'build:prod': 'FES_ENV=prod fes build',
                        'analyze': 'ANALYZE=1 fes build',
                        'dev': 'fes dev',
                        'lint': 'eslint .',
                        'lint:fix': 'eslint . --fix',
                    },
                    dependencies: {
                        '@qlin/request': '0.1.8',
                        'core-js': '3.33.0',
                        '@fesjs/builder-vite': '3.0.2',
                        '@fesjs/fes': '3.1.4',
                        '@fesjs/plugin-model': '3.0.1',
                        '@fesjs/plugin-qiankun': '3.1.1',
                        '@webank/fes-plugin-pmbank-um': '3.1.1',
                        '@fesjs/plugin-request': '4.0.0-beta.5',
                        '@fesjs/fes-design': '0.8.9',
                        'vue': '3.3.4',
                        '@webank/letgo-components': '0.0.2-beta.3',
                    },
                    devDependencies: {
                        '@webank/eslint-config-vue': '2.0.7',
                        'eslint': '8.47.0',
                        'typescript': '5.1.3',
                    },
                },
            });

            const customFiles = transform(codeTemplate, {
                SVG_SPRITE: getIconSprite(schema.icons ?? []),
                IS_MICRO: !isNil(schema.config.mainAppState),
            });

            const currentContent = merge({}, fileTree, customFiles);

            exportZip(currentContent);
        };
        return () => {
            return (
                <FButton type="primary" onClick={handleGenCode} v-slots={{ icon: () => <DownloadOutlined /> }}>
                    出码
                </FButton>
            );
        };
    },
});
