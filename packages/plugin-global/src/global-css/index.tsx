import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import { useModel } from '@webank/letgo-common';
import { css } from '@codemirror/lang-css';
import { CodeMirror } from '@webank/letgo-components';
import type { Project } from '@webank/letgo-designer';

export const GlobalCSS = defineComponent({
    name: 'GlobalCSS',
    props: {
        modelValue: Boolean,
        project: Object as PropType<Project>,
    },
    setup(props, { emit }) {
        const [innerVisible] = useModel(props, emit);

        const onStyleChange = (code: string) => {
            props.project.set('css', code);
        };

        return () => {
            return <FDrawer
                    v-model={[innerVisible.value, 'show']}
                    title="全局样式CSS"
                >
                    <CodeMirror
                        modelValue={props.project.css}
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
