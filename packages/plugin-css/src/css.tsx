import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { MonacoEditor } from '@webank/letgo-components';
import { FButton } from '@fesjs/fes-design';

export const CSSView = defineComponent({
    name: 'CSSView',
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
            return project.css;
        });

        const monacoEditorRef = ref();
        const onSave = async () => {
            try {
                const value = await monacoEditorRef.value.getFormatValue();
                if (value != null)
                    project.set('css', value);
            }
            catch (_) {
            }
        };

        return () => {
            return (
                <div class="letgo-plg-css">
                    <MonacoEditor
                        ref={monacoEditorRef}
                        requireConfig={props.requireConfig}
                        class="letgo-plg-css__code"
                        language="css"
                        value={currentSchema.value}
                        path="__global__.css"
                    >
                    </MonacoEditor>
                    <div class="letgo-plg-css__action">
                        <FButton type="info" size="small" onClick={onSave}>保存样式</FButton>
                    </div>
                </div>
            );
        };
    },
});
