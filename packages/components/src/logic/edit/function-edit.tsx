import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { javascript } from '@codemirror/lang-javascript';
import type { IJavascriptFunction, IPublicModelDocumentModel } from '@webank/letgo-types';
import { formatJsCode } from '@webank/letgo-common';
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
        const tmpFuncBody = ref(props.codeItem.funcBody);
        // TODO 如果进行修改，用户切换其他 code 时进行拦截，提示用户是否要进行保存
        const changeFuncBody = (value: string) => {
            tmpFuncBody.value = value;
        };

        const onBlur = async (value: string) => {
            value = await formatJsCode(value);
            changeFuncBody(value);
        };

        const onSave = () => {
            props.changeContent(props.codeItem.id, {
                funcBody: tmpFuncBody.value,
            });
        };

        return () => {
            return (
                <div>
                    <div class="letgo-comp-logic__header letgo-comp-logic__header--func">
                        <div>
                            <FButton type="primary" size="small" disabled={tmpFuncBody.value === props.codeItem.funcBody} onClick={onSave}>保存</FButton>
                        </div>
                    </div>
                    <div class="letgo-comp-logic__func">
                        <CodeEditor
                            height="200px"
                            hints={props.hints}
                            doc={tmpFuncBody.value}
                            extensions={[javascript()]}
                            changeDoc={changeFuncBody}
                            onBlur={onBlur}
                        />
                    </div>
                </div>
            );
        };
    },
});
