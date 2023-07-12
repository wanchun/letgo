import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { javascript } from '@codemirror/lang-javascript';
import type { IJavascriptFunction } from '@harrywan/letgo-types';
import type { DocumentModel } from '@harrywan/letgo-designer';
import { CodeEditor } from '../../code-editor';
import { contentCls, headerCls } from './function-edit.css';

export const FunctionEdit = defineComponent({
    name: 'FunctionEdit',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptFunction>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptFunction>) => void>,
    },
    setup(props) {
        const tmpFuncBody = ref(props.codeItem.funcBody);
        // TODO 如果进行修改，用户切换其他 code 时进行拦截，提示用户是否要进行保存
        const changeFuncBody = (value: string) => {
            tmpFuncBody.value = value;
        };

        const onSave = () => {
            props.changeContent(props.codeItem.id, {
                funcBody: tmpFuncBody.value,
            });
        };

        return () => {
            return <div>
                <div class={headerCls}>
                    <span></span>
                    <span>{props.codeItem.id}</span>
                    <div>
                        <FButton type="primary" size="small" disabled={tmpFuncBody.value === props.codeItem.funcBody} onClick={onSave}>保存</FButton>
                    </div>
                </div>
                <div class={contentCls}>
                    <CodeEditor documentModel={props.documentModel} hints={props.hints} doc={props.codeItem.funcBody} extensions={[javascript()]} changeDoc={changeFuncBody} />
                </div>
            </div>;
        };
    },
});
