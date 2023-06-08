import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeMirror } from '@webank/letgo-components';
import { json } from '@codemirror/lang-json';
import { codeCls } from './index.css';

export const SchemaView = defineComponent({
    name: 'SchemaView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;
        const { project } = designer;

        const onChange = () => {};

        return () => {
            return (
                <CodeMirror
                    class={codeCls}
                    modelValue={JSON.stringify(project.computedSchema, null, 2)}
                    onUpdate:modelValue={onChange}
                    basic={true}
                    tab={true}
                    tabSize={4}
                    extensions={[json()]}
                    lang={json()}
                ></CodeMirror>
            );
        };
    },
});
