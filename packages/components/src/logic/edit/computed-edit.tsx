import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptComputed, IPublicModelDocumentModel } from '@webank/letgo-types';
import { CodeEditor } from '../../code-editor';
import './computed-edit.less';

/**
 * TODO 待实现功能
 * header 区域可编辑 id
 * header 区域可删除/复制
 */
export const ComputedEdit = defineComponent({
    name: 'ComputedEdit',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptComputed>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptComputed>) => void>,
    },
    setup(props) {
        const changeFuncBody = (value: string) => {
            props.changeContent(props.codeItem.id, {
                funcBody: value,
            });
        };

        return () => {
            return (
                <div class="letgo-comp-logic__computed">
                    <CodeEditor
                        documentModel={props.documentModel}
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
