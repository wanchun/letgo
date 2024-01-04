import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IPublicModelDocumentModel, ITemporaryState } from '@webank/letgo-types';
import { formatExpression } from '@webank/letgo-common';
import { ExpressionEditor } from '../../code-editor';
import './state-edit.less';

/**
 * TODO 待实现功能
 * header 区域可编辑 id
 * header 区域可删除/复制
 */
export const StateEdit = defineComponent({
    name: 'StateEdit',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<ITemporaryState>,
        changeContent: Function as PropType<(id: string, content: Partial<ITemporaryState>) => void>,
    },
    setup(props) {
        const changeInitValue = (value: string) => {
            props.changeContent(props.codeItem.id, {
                initValue: value,
            });
        };

        const onBlur = async (value: string) => {
            value = await formatExpression(value);
            changeInitValue(value);
        };

        return () => {
            return (
                <div class="letgo-comp-logic__state">
                    <div class="letgo-comp-logic__state-content">
                        <div class="letgo-comp-logic__state-input">
                            <label class="letgo-comp-logic__state-label">初始值</label>
                            <ExpressionEditor
                                placeholder="请输入变量内容"
                                hints={props.hints}
                                doc={props.codeItem.initValue}
                                onChangeDoc={changeInitValue}
                                onBlur={onBlur}
                            />
                        </div>
                    </div>
                </div>
            );
        };
    },
});
