import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { IJavascriptComputed } from '@webank/letgo-types';
import { CodeEditor, useCodeSave } from '@webank/letgo-components';
import './computed-edit.less';

/**
 * TODO 待实现功能
 * header 区域可编辑 id
 * header 区域可删除/复制
 */
export const ComputedEdit = defineComponent({
    name: 'ComputedEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptComputed>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptComputed>) => void>,
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
                <div class="letgo-comp-logic__computed">
                    <CodeEditor
                        ref={codeEditorRef}
                        height="100%"
                        class="letgo-comp-logic__computed-editor"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onBlur={onBlur}
                        id={props.codeItem.id}
                        fullscreen={false}
                        lineNumbers
                    />
                    <p style="font-size: 12px">提示: 用已有变量计算出新的变量, 当依赖的变量更新时，新的变量自动更新</p>
                </div>
            );
        };
    },
});
