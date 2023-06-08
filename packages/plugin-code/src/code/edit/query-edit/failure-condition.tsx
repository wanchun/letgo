import { FInput } from '@fesjs/fes-design';
import { CloseOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IFailureCondition } from '@webank/letgo-types';
import { actionCls, addBtnCls, conditionCls, failureConditionCls, failureItemCls, iconCls } from './failure-condition.css';

export default defineComponent({
    props: {
        failureCondition: {
            type: Array as PropType<IFailureCondition[]>,
            default: () => [] as IFailureCondition[],
        },
        onRemove: Function as PropType<(item: IFailureCondition) => void>,
        onAdd: Function as PropType<() => void>,
    },
    setup(props) {
        const deleteFailureCondition = (item: IFailureCondition) => {
            props.onRemove(item);
        };
        const addFailureCondition = () => {
            props.onAdd();
        };
        const renderContent = () => {
            return props.failureCondition.map((item) => {
                return <li class={failureItemCls}>
                <FInput class={conditionCls} v-model={item.condition} placeholder="{{error}}" />
                <FInput v-model={item.message} placeholder="{{data.error.message}}" />
                <span class={actionCls} onClick={() => deleteFailureCondition(item)}>
                    <CloseOutlined class={iconCls} />
                </span>
            </li>;
            });
        };

        return () => {
            return <ul class={failureConditionCls}>
                {renderContent()}
                <li class={addBtnCls} onClick={addFailureCondition}><PlusOutlined />新增</li>
            </ul>;
        };
    },
});
