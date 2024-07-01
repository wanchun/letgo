import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeEditor } from '@webank/letgo-components';
import { FButton } from '@fesjs/fes-design';

// 默认 class code 模板
const DEFAULT_CLASS_CODE = `
class Main extends Page {
    constructor(ctx) {
        super(ctx);
    }
}
`;

export const JsEditView = defineComponent({
    name: 'JsEditView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;
        const { project } = designer;

        const tmp = ref((project.currentDocument.classCode || DEFAULT_CLASS_CODE).trim());

        const onChange = (val: string) => {
            tmp.value = val;
        };

        const onSave = () => {
            try {
                project.currentDocument.classCode = tmp.value;
            }
            catch (e) {
                console.error(e);
            }
        };

        return () => {
            return (
                <div class="letgo-plg-logic">
                    <CodeEditor
                        class="letgo-plg-logic__code"
                        height="100%"
                        id="__class_code"
                        theme={{
                            '&': {
                                border: '1px solid var(--letgo-border-color)',
                                borderRadius: 0,
                                borderRight: 'none',
                                borderLeft: 'none',
                                height: '100%',
                            },
                        }}
                        doc={tmp.value}
                        onChange={onChange}
                        bordered={false}
                        lineNumbers={true}
                        fullscreen={false}
                    >
                    </CodeEditor>
                    <div class="letgo-plg-logic__action">
                        <FButton type="info" size="small" onClick={onSave}>保存</FButton>
                    </div>
                </div>
            );
        };
    },
});
