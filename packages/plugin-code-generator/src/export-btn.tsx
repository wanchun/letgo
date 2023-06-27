import { defineComponent } from 'vue';
import { material, project } from '@webank/letgo-engine';
import { IPublicEnumTransformStage, isProCodeComponentType } from '@webank/letgo-types';
import { FButton, FMessage } from '@fesjs/fes-design';
import { cloneDeep } from 'lodash-es';
import { exportZip } from './export-zip';
import { schemaToCode } from './genCode';

const defaultObjectConfig = `
import { defineBuildConfig } from '@fesjs/fes';

export default defineBuildConfig({
    proxy: {
        '/rcs-mas': {
            target: process.env.TEST_HOST,
            secure: false,
            changeOrigin: true,
        },
    },
    layout: {
        title: 'Fes.js',
        navigation: 'mixin',
        multiTabs: false,
        footer: null,
        menus: [
            {
                name: 'index',
            },
            META
        ],
    },
});
`;

// debug func
async function saveFile(rootComponents: {
    template: string
    script: string
}[]) {
    const content
        = `
        ${rootComponents[0].template}

        ${rootComponents[0].script}
        `;
    const options = {
        types: [
            {
                description: 'vue',
                accept: {
                    'text/plain': ['.vue'],
                },
            },
        ],
    };
    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return handle;
}

export default defineComponent({
    setup() {
        const genCode = async () => {
            const packages = material.getAssets().packages;
            const schema = project.exportSchema(IPublicEnumTransformStage.Save);
            const usedPackages = [];
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
            // console.log(schema);
            // saveFile(schemaToCode(schema));
            // return;
            const rootComponents = schemaToCode(schema);
            const defaultContent = await import('./template.json');
            const currentContent = cloneDeep(defaultContent.default);
            const pages = rootComponents.reduce((acc, cur) => {
                acc[cur.meta.fileName] = `
                ${cur.template}

                ${cur.script}
                `;
                return acc;
            }, {} as Record<string, any>);

            currentContent.src.pages = Object.assign(currentContent.src.pages, pages);
            currentContent['.fes.js'] = defaultObjectConfig.replace('META', rootComponents.reduce((acc, cur) => {
                return acc += `
                    {
                        name: '${cur.meta.name}'
                    },
                `;
            }, ''));
            exportZip(currentContent);
        };
        return () => {
            return (
                <FButton type="primary" onClick={genCode}>
                    出码
                </FButton>
            );
        };
    },
});
