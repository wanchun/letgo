import { defineComponent } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import { useModel } from '@webank/letgo-common';

export const GlobalConfig = defineComponent({
    name: 'GlobalConfig',
    props: {
        modelValue: Boolean,
    },
    setup(props, { emit }) {
        const [innerVisible] = useModel(props, emit);

        return () => {
            return <FDrawer
                    v-model={[innerVisible.value, 'show']}
                    title="项目配置"
                >
                    <div>todo</div>
                </FDrawer>;
        };
    },
});
