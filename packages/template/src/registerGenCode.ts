import { plugins } from '@harrywan/letgo-engine';
import PluginCodeGenerator, { ImportType } from '@harrywan/letgo-plugin-code-generator';
import type { GenCodeOptions } from '@harrywan/letgo-plugin-code-generator';
import type { IPublicTypeProjectSchema } from '@harrywan/letgo-types';
import { isRestQueryResource } from '@harrywan/letgo-types';
import codeTemplate from './template.json';

function findAPIPrefix(schema: IPublicTypeProjectSchema) {
    for (const code of schema.code.code) {
        if (isRestQueryResource(code) && code.api)
            return `/${code.api.split('/')[1]}`;
    }
    for (const compTree of schema.componentsTree) {
        for (const code of compTree.code.code) {
            if (isRestQueryResource(code) && code.api)
                return `/${code.api.split('/')[1]}`;
        }
    }
    return '';
}

let apiPrefix = '';
export function registerGenCode() {
    plugins.register<GenCodeOptions>(PluginCodeGenerator, {
        template: codeTemplate,
        transformSchema(schema) {
            apiPrefix = findAPIPrefix(schema);
            return schema;
        },
        transformFileStruct(filesStruct) {
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
        formattedCode(code) {
            if (!apiPrefix) {
                code.src['app.jsx'] = `
                import { defineRuntimeConfig } from '@fesjs/fes';
    
                export default defineRuntimeConfig({
                });
            `;
            }
            else {
                code.src['app.jsx'] = `
                import { defineRuntimeConfig } from '@fesjs/fes';
    
                export default defineRuntimeConfig({
                    request: {
                        baseURL: '${apiPrefix}'
                    }
                });
            `;
            }
            return code;
        },
        globalCssFile: 'global.less',
        package: {
            scripts: {
                'build:test': 'FES_ENV=test fes build',
                'build:prod': 'FES_ENV=prod fes build',
                'analyze': 'ANALYZE=1 fes build',
                'dev': 'fes dev',
                'lint': 'eslint .',
                'lint:fix': 'eslint . --fix',
            },
            dependencies: {
                '@qlin/request': '0.1.6',
                'core-js': '3.32.1',
                '@babel/preset-env': '7.20.2',
                '@fesjs/builder-vite': '3.0.2',
                '@fesjs/fes': '3.1.2',
                '@webank/fes-plugin-pmbank-um': '3.1.1',
                '@fesjs/plugin-request': '4.0.0-beta.4',
                '@fesjs/fes-design': '0.8.5',
                'vue': '3.3.4',
            },
            devDependencies: {
                '@webank/eslint-config-vue': '2.0.7',
                'eslint': '8.47.0',
                'typescript': '5.1.3',
            },
        },
    });
}
