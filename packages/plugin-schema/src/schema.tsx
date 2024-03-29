import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeMirror } from '@webank/letgo-components';
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

        const currentSchema = computed(() => {
            return JSON.stringify(project.currentDocument?.computedSchema ?? {}, null, 2);
        });

        const tmp = ref(currentSchema.value);

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
                <div class="letgo-plg-schema">
                    <CodeMirror
                        class="letgo-plg-schema__code"
                        theme={{
                            '&': {
                                border: '1px solid var(--letgo-border-color)',
                                borderRadius: 0,
                                borderRight: 'none',
                                borderLeft: 'none',
                                height: '100%',
                            },
                        }}
                        doc={currentSchema.value}
                        onChange={onChange}
                        extensions={[json()]}
                        bordered={false}
                        fullscreen={false}
                    >
                    </CodeMirror>
                    <div class="letgo-plg-schema__action">
                        <FButton type="info" size="small" onClick={onSave}>保存 Schema</FButton>
                    </div>
                </div>
            );
        };
    },
});
