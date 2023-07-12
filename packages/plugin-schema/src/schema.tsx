import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Designer } from '@fesjs/letgo-designer';
import { CodeEditor } from '@fesjs/letgo-components';
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

        const currentSchema = computed(() => {
            return JSON.stringify(project.currentDocument?.computedSchema ?? {}, null, 2);
        });

        return () => {
            return (
                <div class={wrapperCls}>
                    <CodeEditor
                        class={codeCls}
                        doc={currentSchema.value}
                        changeDoc={onChange}
                        extensions={[json()]}
                        bordered={false}
                        fullscreen={false}
                    ></CodeEditor>
                    <div class={actionCls}>
                        <FButton type="info" size="small" onClick={onSave}>保存 Schema</FButton>
                    </div>
                </div>
            );
        };
    },
});
