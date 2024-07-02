import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptComputed } from '@webank/letgo-types';
import { CodeEditor } from '@webank/letgo-components';
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
        const changeFuncBody = (value: string, id?: string) => {
            props.changeContent(id || props.codeItem.id, {
                funcBody: value,
            });
        };

        return () => {
            return (
                <div class="letgo-comp-logic__computed">
                    <CodeEditor
                        class="letgo-comp-logic__computed-editor"
                        height="100%"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onChange={changeFuncBody}
                        id={props.codeItem.id}
                    />
                </div>
            );
        };
    },
});
