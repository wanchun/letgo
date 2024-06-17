import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeMirror } from '@webank/letgo-components';
import { css } from '@codemirror/lang-css';
import { FButton } from '@fesjs/fes-design';

export const CSSView = defineComponent({
    name: 'CSSView',
    props: {
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

        const tmp = ref(currentSchema.value);

        const onChange = (val: string) => {
            tmp.value = val;
        };

        const onSave = () => {
            try {
                project.set('css', tmp.value);
            }
            catch (e) {
                console.error(e);
            }
        };

        return () => {
            return (
                <div class="letgo-plg-css">
                    <CodeMirror
                        class="letgo-plg-css__code"
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
                        extensions={[css()]}
                        bordered={false}
                        fullscreen={false}
                    >
                    </CodeMirror>
                    <div class="letgo-plg-css__action">
                        <FButton type="info" size="small" onClick={onSave}>保存样式</FButton>
                    </div>
                </div>
            );
        };
    },
});
