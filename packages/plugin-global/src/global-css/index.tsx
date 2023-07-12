import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FDrawer } from '@fesjs/fes-design';
import { useModel } from '@fesjs/letgo-common';
import { css } from '@codemirror/lang-css';
import { CodeEditor } from '@fesjs/letgo-components';
import type { Project } from '@fesjs/letgo-designer';

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
                    <CodeEditor
                        doc={props.project.css}
                        changeDoc={onStyleChange}
                        extensions={[css()]}
                    />
                </FDrawer>;
        };
    },
});
