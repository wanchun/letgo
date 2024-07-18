import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { MonacoEditor } from '@webank/letgo-components';
import { FButton } from '@fesjs/fes-design';

export const SchemaView = defineComponent({
    name: 'SchemaView',
    props: {
        requireConfig: Object,
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;
        const { project } = designer;

        const currentSchema = computed(() => {
            return JSON.stringify(project.currentDocument?.computedSchema ?? {}, null, 2);
        });

        const tmp = ref(currentSchema.value);

        const onChange = (val: string) => {
            tmp.value = val;
        };

        const monacoEditorRef = ref();
        const onSave = async () => {
            try {
                const value = await monacoEditorRef.value.getFormatValue();
                if (value) {
                    const newSchema = JSON.parse(value);
                    project.currentDocument.importSchema(newSchema);
                }
            }
            catch (e) {
                console.error(e);
            }
        };

        return () => {
            return (
                <div class="letgo-plg-schema">
                    <MonacoEditor
                        ref={monacoEditorRef}
                        requireConfig={props.requireConfig}
                        class="letgo-plg-schema__code"
                        language="json"
                        value={currentSchema.value}
                        onChange={onChange}
                        path="__page_schema.json"
                        fullScreen
                    >
                    </MonacoEditor>
                    <div class="letgo-plg-schema__action">
                        <FButton type="info" size="small" onClick={onSave}>保存 Schema</FButton>
                    </div>
                </div>
            );
        };
    },
});
