import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { material, project } from '@harrywan/letgo-engine';
import type { IPublicTypePackage } from '@harrywan/letgo-types';
import { IPublicEnumTransformStage, isProCodeComponentType } from '@harrywan/letgo-types';
import { FButton, FMessage } from '@fesjs/fes-design';
import { DownloadOutlined } from '@fesjs/fes-design/icon';
import { cloneDeep, get, merge, set } from 'lodash-es';
import type { FileStruct, GenCodeOptions, GlobalStateCode } from './common/types';
import { exportZip } from './export-zip';
import { genFileName } from './common/page-meta';
import { toAssemble } from './common/build';
import { genGlobalStateCode } from './common/global-state';
import { schemaToCode } from './common';
import DefaultContent from './defaultContent';

const packageJSON = {
    name: '@letgo/gen-code',
    version: '1.0.0',
    license: 'MIT',
    dependencies: {
        '@qlin/request': '0.1.6',
        'core-js': '3.32.1',
        'vue': '3.3.4',
    },
};

function handlePackageJSON(packages: IPublicTypePackage[], option: GenCodeOptions) {
    const defaultPackageJSON: Record<string, any> = cloneDeep(packageJSON);
    packages.forEach((item) => {
        defaultPackageJSON.dependencies[item.package] = item.version;
    });
    if (option.package)
        return merge(defaultPackageJSON, option.package);

    return defaultPackageJSON;
}

async function genCode({ filesStruct, packages, globalState, globalCss, option }: {
    filesStruct: FileStruct[]
    packages: IPublicTypePackage[]
    globalState?: GlobalStateCode
    globalCss?: string
    option: GenCodeOptions
}) {
    if (option.transformFileStruct)
        filesStruct = option.transformFileStruct(filesStruct);

    const currentContent: any = merge({}, DefaultContent, option.template);
    const pages = filesStruct.reduce((acc, cur) => {
        acc[genFileName(cur)] = toAssemble(cur);
        return acc;
    }, {} as Record<string, any>);

    currentContent.src.pages = Object.assign(currentContent.src.pages, pages);

    if (globalState)
        (currentContent.src.use as Record<string, string>)[globalState.filename] = globalState.content;

    if (globalCss) {
        const cssFilePath = ['src'].concat((option.globalCssFile || 'global.less').split('/'));
        const defaultCss = get(currentContent, cssFilePath) || '';
        set(currentContent, cssFilePath, `
        ${defaultCss}
        ${globalCss}
        `);
    }
    currentContent['package.json'] = JSON.stringify(handlePackageJSON(packages, option), null, 4);

    if (option?.formattedCode)
        exportZip(option?.formattedCode(currentContent));

    else
        exportZip(currentContent);
}

// debug func
// async function saveFile(rootComponents: FileStruct[]) {
//     const content = toAssemble(rootComponents[0]);
//     const options = {
//         types: [
//             {
//                 description: 'vue jsx',
//                 accept: {
//                     'text/plain': ['.jsx'],
//                 },
//             },
//         ],
//     };
//     const handle = await window.showSaveFilePicker(options);
//     const writable = await handle.createWritable();
//     await writable.write(content);
//     await writable.close();
//     return handle;
// }

function getSchema(option: GenCodeOptions) {
    const schema = project.exportSchema(IPublicEnumTransformStage.Save);
    if (option?.transformSchema)
        return option.transformSchema(schema);

    return schema;
}

export default defineComponent({
    props: {
        option: Object as PropType<GenCodeOptions>,
    },
    setup(props) {
        const handleGenCode = async () => {
            const packages = material.getAssets().packages;
            const schema = getSchema(props.option);
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
            const globalState = genGlobalStateCode(schema);
            const globalCss = schema.css;

            const filesStruct = schemaToCode(schema);
            genCode({
                filesStruct,
                globalState,
                globalCss,
                packages,
                option: props.option,
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
