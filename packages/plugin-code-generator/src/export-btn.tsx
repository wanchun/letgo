import { defineComponent } from 'vue';
import { material, project } from '@webank/letgo-engine';
import { IPublicEnumTransformStage, isProCodeComponentType } from '@webank/letgo-types';
import { FButton, FMessage } from '@fesjs/fes-design';
import { genFesCode } from './gen-fes';
import { schemaToCode } from './common';
import type { FileStruct } from './common/types';
import { toAssemble } from './common/build';
import { genGlobalStateCode } from './common/global-state';

// debug func
async function saveFile(rootComponents: FileStruct[]) {
    const content = toAssemble(rootComponents[0]);
    const options = {
        types: [
            {
                description: 'vue',
                accept: {
                    'text/plain': ['.vue', '.jsx'],
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

            // 必须先执行，初始化 global 代码生成的上下文
            const globalState = genGlobalStateCode(schema);

            // console.log(schema);
            // saveFile(schemaToCode(schema).pages);
            // return;
            const code = schemaToCode(schema);
            genFesCode(code, globalState);
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
