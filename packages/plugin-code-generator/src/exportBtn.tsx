import { defineComponent } from 'vue';
import { project, material } from '@webank/letgo-engine';
import { TransformStage, isProCodeComponentType } from '@webank/letgo-types';
import { FButton, FMessage } from '@fesjs/fes-design';

export default defineComponent({
    setup() {
        const genCode = () => {
            const packages = material.getAssets().packages;
            const schema = project.getSchema(TransformStage.Save);
            const usedPackages = [];
            for (const component of schema.componentsMap) {
                if (isProCodeComponentType(component)) {
                    const pkg = packages.find(
                        (pkg) =>
                            pkg.package === component.package &&
                            pkg.version === component.version,
                    );
                    if (!pkg) {
                        FMessage.error('组件版本匹配异常，请联系开发处理');
                        return;
                    }
                    usedPackages.push(pkg);
                }
            }
            console.log(usedPackages);
            console.log(schema);
        };
        return () => {
            return (
                <div class="logo-wrapper">
                    <FButton type="primary" onClick={genCode}>
                        出码
                    </FButton>
                </div>
            );
        };
    },
});
