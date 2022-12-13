import { defineComponent } from 'vue';
import { project } from '@webank/letgo-engine';
import { TransformStage } from '@webank/letgo-types';
import { FButton } from '@fesjs/fes-design';

export default defineComponent({
    setup() {
        const genCode = () => {
            const schema = project.getSchema(TransformStage.Save);
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
