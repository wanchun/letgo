import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FInput } from '@fesjs/fes-design';
import type { ITemporaryState } from '@webank/letgo-types';
import { contentCls, headerCls, inputItemCls, inputLabelCls } from './state-edit.css';

/**
 * TODO 待实现功能
 * header 区域可编辑 id
 * header 区域可删除/复制
 */
export default defineComponent({
    props: {
        codeItem: Object as PropType<ITemporaryState>,
        changeContent: Function as PropType<(id: string, content: Partial<ITemporaryState>) => void>,
    },
    setup(props) {
        const changeInitValue = (value: string) => {
            props.changeContent(props.codeItem.id, {
                initValue: value,
            });
        };

        return () => {
            return <div>
                <div class={headerCls}>
                    {props.codeItem.id}
                </div>
                <div class={contentCls}>
                    <div class={inputItemCls}>
                        <label class={inputLabelCls}>初始值</label>
                        <FInput modelValue={props.codeItem.initValue} onChange={changeInitValue} placeholder="null" />
                    </div>
                </div>
            </div>;
        };
    },
});
