import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { javascript } from '@codemirror/lang-javascript';
import type { IJavascriptComputed, IPublicModelDocumentModel } from '@webank/letgo-types';
import { CodeEditor } from '../../code-editor';
import './code-edit.less';
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
            return (
                <div>
                    <div class="letgo-comp-logic__header letgo-comp-logic__header--computed">
                        <div>
                            <FButton type="primary" size="small" disabled={tmpFuncBody.value === props.codeItem.funcBody} onClick={onSave}>保存</FButton>
                        </div>
                    </div>
                    <div class="letgo-comp-logic__computed">
                        <CodeEditor documentModel={props.documentModel} extensions={[javascript()]} hints={props.hints} doc={props.codeItem.funcBody} changeDoc={changeFuncBody} />
                    </div>
                </div>
            );
        };
    },
});
