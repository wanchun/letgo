import { defineComponent } from 'vue';
import { IPublicEnumTransformStage, project } from '@webank/letgo-engine';
import type { IPublicTypeProjectSchema } from '@webank/letgo-engine';
import {
    ImportType,
    exportZip,
    genLowCodeComponent,
    genProject,
} from '@webank/letgo-code-generator';
import { FButton } from '@fesjs/fes-design';
import { DownloadOutlined } from '@fesjs/fes-design/icon';
import { forEach, isNil, isObject, isString, merge } from 'lodash-es';
import Mustache from 'mustache';
import codeTemplate from './template';

interface Template {
    [key: string]: string | Template;
}

function transform(codeTemplate: Template, params?: Record<string, any>) {
    return forEach(codeTemplate, (value, key) => {
        if (isString(value))
            codeTemplate[key] = Mustache.render(value, params);

        else if (isObject(value))
            transform(value, params); // 递归遍历嵌套对象
    });
}

function genProjectCodes(schema: IPublicTypeProjectSchema, logger: Record<string, any>) {
    const fileTree = genProject({
        // isSdkRender: true,
        // sdkRenderConfig: {
        //     pickClassCode: true,
        // },
        schema,
        logger,
        transformJsx: (filesStruct) => {
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
        basePackageJSON: {
            dependencies: {
                '@fesjs/fes-design': '0.8.1',
            },
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
                '@qlin/request': '0.2.6',
                'core-js': '3.33.0',
                '@fesjs/builder-vite': '3.0.2',
                '@fesjs/fes': '3.1.4',
                '@fesjs/plugin-model': '3.0.1',
                '@fesjs/plugin-qiankun': '3.1.1',
                '@webank/fes-plugin-pmbank-um': '3.1.1',
                '@fesjs/plugin-request': '4.0.0-rc.3',
                '@fesjs/fes-design': '0.8.24',
                'vue': '3.3.4',
            },
            devDependencies: {
                '@webank/eslint-config-vue': '2.0.7',
                'eslint': '8.47.0',
                'typescript': '5.1.3',
            },
        },
    });

    const customFiles = transform(codeTemplate, {
        IS_MICRO: !isNil(schema.config.mainAppState),
    });

    return merge({}, fileTree, customFiles);
}

function isLowcodeComponent(schema: IPublicTypeProjectSchema) {
    return schema.componentsTree.some(item => item.componentName === 'Component');
}

function _genLowcodeComponent(schema: IPublicTypeProjectSchema) {
    const fileTree = genLowCodeComponent({
        schema,
    });

    return fileTree;
}

export default defineComponent({
    props: {
        logger: Object,
    },
    setup(props) {
        const handleGenCode = async () => {
            const schema = project.exportSchema(IPublicEnumTransformStage.Save);

            if (isLowcodeComponent(schema))
                exportZip(_genLowcodeComponent(schema));
            else
                exportZip(genProjectCodes(schema, props.logger));
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
