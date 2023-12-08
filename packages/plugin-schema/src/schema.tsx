import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Designer } from '@harrywan/letgo-designer';
import { CodeEditor } from '@harrywan/letgo-components';
import { json } from '@codemirror/lang-json';
import { FButton } from '@fesjs/fes-design';

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
                <div class="letgo-plg-schema">
                    <CodeEditor
                        class="letgo-plg-schema__code"
                        theme={{
                            '&': {
                                border: '1px solid #cfd0d3',
                                borderRadius: 0,
                                borderRight: 'none',
                                borderLeft: 'none',
                                height: '100%',
                            },
                        }}
                        doc={currentSchema.value}
                        changeDoc={onChange}
                        extensions={[json()]}
                        bordered={false}
                        fullscreen={false}
                    ></CodeEditor>
                    <div class="letgo-plg-schema__action">
                        <FButton type="info" size="small" onClick={onSave}>保存 Schema</FButton>
                    </div>
                </div>
            );
        };
    },
});
