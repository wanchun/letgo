import { FInput } from '@fesjs/fes-design';
import { CloseOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import { defineComponent } from 'vue';
import { actionCls, addBtnCls, conditionCls, failureConditionCls, failureItemCls, iconCls } from './failure-condition.css';

export default defineComponent({
    setup() {
        return () => {
            return <ul class={failureConditionCls}>
                <li class={failureItemCls}>
                    <FInput class={conditionCls} placeholder="{{error}}" />
                    <FInput placeholder="{{data.error.message}}" />
                    <span class={actionCls}>
                        <CloseOutlined class={iconCls} />
                    </span>
                </li>
                <li class={addBtnCls}><PlusOutlined />新增</li>
            </ul>;
        };
    },
});
