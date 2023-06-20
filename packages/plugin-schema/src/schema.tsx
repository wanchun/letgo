import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeMirror } from '@webank/letgo-components';
import { json } from '@codemirror/lang-json';
import { FButton } from '@fesjs/fes-design';
import { actionCls, codeCls, wrapperCls } from './index.css';

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

        const tmp = ref('');

        const onChange = (val: string) => {
            tmp.value = val;
        };

        const onSave = () => {
            try {
                const newSchema = JSON.parse(tmp.value);
                project.currentDocument.importSchema(newSchema);
            }
            catch (e) {
                console.error(e);
            }
        };

        return () => {
            return (
                <div class={wrapperCls}>
                    <CodeMirror
                        class={codeCls}
                        modelValue={JSON.stringify(project.currentDocument?.computedSchema ?? {}, null, 2)}
                        onUpdate:modelValue={onChange}
                        basic={true}
                        tab={true}
                        tabSize={4}
                        extensions={[json()]}
                        lang={json()}
                    ></CodeMirror>
                    <div class={actionCls}>
                        <FButton type="info" size="small" onClick={onSave}>保存 Schema</FButton>
                    </div>
                </div>
            );
        };
    },
});
