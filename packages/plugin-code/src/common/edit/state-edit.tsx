import type { PropType } from 'vue';
import { defineComponent, ref, watch } from 'vue';
import { FScrollbar } from '@fesjs/fes-design';
import type { ITemporaryState } from '@webank/letgo-types';
import { ExpressionEditor } from '@webank/letgo-components';
import './state-edit.less';
import { debounce } from 'lodash-es';
import { isSyntaxError } from '@webank/letgo-common';

/**
 * TODO 待实现功能
 * header 区域可编辑 id
 * header 区域可删除/复制
 */
export const StateEdit = defineComponent({
    name: 'StateEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<ITemporaryState>,
        changeContent: Function as PropType<(id: string, content: Partial<ITemporaryState>) => void>,
    },
    setup(props) {
        const applyVertical = (val: string) => {
            if (!val)
                return false;
            return val.includes('\n') || val.length > 25;
        };
        const isMore = ref(applyVertical(props.codeItem.initValue));

        watch(() => props.codeItem.initValue, (val) => {
            isMore.value = applyVertical(val);
        });

        const changeInitValue = (value: string) => {
            isMore.value = applyVertical(value);
            props.changeContent(props.codeItem.id, {
                initValue: value,
            });
        };

        const onInput = debounce((val: string) => {
            if (!isSyntaxError(val))
                changeInitValue(val);
        }, 300);

        return () => {
            return (
                <FScrollbar containerClass="letgo-comp-logic__state">
                    <div class="letgo-comp-logic__state-content">
                        <div class={['letgo-comp-logic__state-input', isMore.value && 'letgo-comp-logic__state-input--more']}>
                            <label class="letgo-comp-logic__state-label">初始值</label>
                            <ExpressionEditor
                                placeholder="请输入变量初始值"
                                hints={props.hints}
                                doc={props.codeItem.initValue}
                                onChange={changeInitValue}
                                onInput={onInput}
                                id={props.codeItem.id}
                            />
                        </div>
                    </div>
                </FScrollbar>
            );
        };
    },
});
