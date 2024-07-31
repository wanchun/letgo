import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { IJavascriptFunction } from '@webank/letgo-types';
import { CodeEditor, useCodeSave } from '@webank/letgo-components';
import './function-edit.less';

export const FunctionEdit = defineComponent({
    name: 'FunctionEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptFunction>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptFunction>) => void>,
    },
    setup(props) {
        const { codeEditorRef, onBlur } = useCodeSave({
            code: computed(() => props.codeItem.funcBody),
            save(code) {
                props.changeContent(props.codeItem.id, {
                    funcBody: code,
                });
            },
        });

        return () => {
            return (
                <div class="letgo-comp-logic__func">
                    <CodeEditor
                        ref={codeEditorRef}
                        class="letgo-comp-logic__func-editor"
                        height="100%"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onBlur={onBlur}
                        id={props.codeItem.id}
                        fullscreen={false}
                        lineNumbers
                    />
                </div>
            );
        };
    },
});
