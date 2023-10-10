import { defineComponent } from 'vue';
import { material, project } from '@harrywan/letgo-engine';
import type { IPublicTypePackage, IPublicTypeProjectSchema } from '@harrywan/letgo-types';
import { DEFAULT_CONTENT, ImportType, exportZip, genGlobalStateCode, genPackageJSON, genPageCode } from '@harrywan/letgo-code-generator';
import { IPublicEnumTransformStage, isProCodeComponentType } from '@harrywan/letgo-types';
import { FButton, FMessage } from '@fesjs/fes-design';
import { DownloadOutlined } from '@fesjs/fes-design/icon';
import { forEach, get, isNil, isObject, isString, merge, set } from 'lodash-es';
import type { GlobalStateCode } from '@harrywan/letgo-code-generator';
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

async function genCode({ schema, packages, globalState, globalCss }: {
    schema: IPublicTypeProjectSchema
    packages: IPublicTypePackage[]
    globalState?: GlobalStateCode
    globalCss?: string
}) {
    // 处理 codeTemplate
    const code = transform(codeTemplate, { IS_MICRO: !isNil(schema.config.mainAppState) });

    const currentContent: any = merge({}, DEFAULT_CONTENT, code);
    const pages = genPageCode(schema, (filesStruct) => {
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
    });
    currentContent.src.pages = Object.assign(currentContent.src.pages, pages);

    if (globalState)
        (currentContent.src.use as Record<string, string>)[globalState.filename] = globalState.content;

    if (globalCss) {
        const cssFilePath = ['src', 'global.less'];
        const defaultCss = get(currentContent, cssFilePath) || '';
        set(currentContent, cssFilePath, `
        ${defaultCss}
        ${globalCss}
        `);
    }
    currentContent['package.json'] = JSON.stringify(genPackageJSON(packages, {
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
        },
        devDependencies: {
            '@webank/eslint-config-vue': '2.0.7',
            'eslint': '8.47.0',
            'typescript': '5.1.3',
        },
    }), null, 4);

    exportZip(currentContent);
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

            // 必须先执行，初始化 global 代码生成的上下文
            const globalState = genGlobalStateCode(schema, {
                afterConfig: (params) => {
                    if (schema.config.mainAppState) {
                        params.import.push({
                            type: ImportType.ImportSpecifier,
                            imported: 'useModel',
                            source: '@fesjs/fes',
                        });
                        params.code = `
    const mainAppState = useModel('qiankunStateFromMain');
    ${params.code}
    letgoContext.mainAppState = mainAppState;
    `;
                    }
                },
            });
            const globalCss = schema.css;

            genCode({
                schema,
                globalState,
                globalCss,
                packages,
            });
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
