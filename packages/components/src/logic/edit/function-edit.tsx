import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptFunction, IPublicModelDocumentModel } from '@webank/letgo-types';
import { CodeEditor } from '../../code-editor';
import './function-edit.less';

export const FunctionEdit = defineComponent({
    name: 'FunctionEdit',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptFunction>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptFunction>) => void>,
    },
    setup(props) {
        const changeFuncBody = (value: string) => {
            props.changeContent(props.codeItem.id, {
                funcBody: value,
            });
        };

        return () => {
            return (
                <div class="letgo-comp-logic__func">
                    <CodeEditor
                        documentModel={props.documentModel}
                        height="200px"
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
