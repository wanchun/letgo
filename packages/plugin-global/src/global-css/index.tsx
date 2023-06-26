import { defineComponent } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import { useModel } from '@webank/letgo-common';
import { css } from '@codemirror/lang-css';
import { CodeMirror } from '@webank/letgo-components';

export const GlobalCSS = defineComponent({
    name: 'GlobalCSS',
    props: {
        modelValue: Boolean,
        css: String,
    },
    setup(props, { emit }) {
        const [innerVisible] = useModel(props, emit);

        const onStyleChange = (code: string) => {
            console.log(code);
        };

        return () => {
            return <FDrawer
                    v-model={[innerVisible.value, 'show']}
                    title="全局样式CSS"
                >
                    <CodeMirror
                        modelValue={props.css}
                        onUpdate:modelValue={onStyleChange}
                        basic={true}
                        tab={true}
                        tabSize={4}
                        lang={css()}
                        extensions={[css()]}
                    />
                </FDrawer>;
        };
    },
});
