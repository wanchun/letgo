import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { css } from '@codemirror/lang-css';
import { CodeEditor } from '@harrywan/letgo-components';
import type { Project } from '@harrywan/letgo-designer';

export const GlobalCSS = defineComponent({
    name: 'GlobalCSS',
    props: {
        project: Object as PropType<Project>,
    },
    setup(props) {
        const onStyleChange = (code: string) => {
            props.project.set('css', code);
        };

        return () => {
            return (
                <CodeEditor
                    doc={props.project.css}
                    changeDoc={onStyleChange}
                    extensions={[css()]}
                />
            );
        };
    },
});
