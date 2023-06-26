import { defineComponent } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import { useModel } from '@webank/letgo-common';
import { javascript } from '@codemirror/lang-javascript';
import { CodeMirror } from '@webank/letgo-components';

export const GlobalJS = defineComponent({
    name: 'GlobalJS',
    props: {
        modelValue: Boolean,
        code: String,
    },
    setup(props, { emit }) {
        const [innerVisible] = useModel(props, emit);

        const onJsChange = (code: string) => {
            console.log(code);
        };

        return () => {
            return <FDrawer
                    v-model={[innerVisible.value, 'show']}
                    title="全局脚本配置"
                >
                    <CodeMirror
                        modelValue={props.code}
                        onUpdate:modelValue={onJsChange}
                        basic={true}
                        tab={true}
                        tabSize={4}
                        lang={javascript()}
                        extensions={[javascript()]}
                    />
                </FDrawer>;
        };
    },
});
