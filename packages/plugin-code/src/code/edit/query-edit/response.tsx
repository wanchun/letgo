import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { IFailureCondition, IJavascriptQuery } from '@webank/letgo-types';
import { FCheckbox, FInput } from '@fesjs/fes-design';
import { uniqueId } from '@webank/letgo-common';
import Category from './category';
import ContentItem from './content-item';
import FailureCondition from './failure-condition';

function genFailureConditionId() {
    return uniqueId('fc_');
}

export default defineComponent({
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const addFailureCondition = () => {
            const queryFailureCondition = [...props.codeItem.queryFailureCondition];
            queryFailureCondition.push({
                id: genFailureConditionId(),
                condition: '',
                message: '',
            });
            props.changeCodeItem({
                queryFailureCondition,
            });
        };

        const removeFailureCondition = (item: IFailureCondition) => {
            const queryFailureCondition = [...props.codeItem.queryFailureCondition];
            const index = queryFailureCondition.findIndex(fc => fc.id === item.id);
            if (index !== -1)
                queryFailureCondition.splice(index, 1);

            props.changeCodeItem({
                queryFailureCondition,
            });
        };

        return () => {
            return <>
                <Category title="请求失败" v-slots={{
                    default: () => {
                        return <>
                            <ContentItem v-slots={{
                                content: () => {
                                    return <FCheckbox v-model={props.codeItem.showFailureToaster}>展示失败的信息在失败的时候</FCheckbox>;
                                },
                            }} />
                            <ContentItem label="失败条件" v-slots={{
                                content: () => {
                                    return <FailureCondition onAdd={addFailureCondition} onRemove={removeFailureCondition} failureCondition={props.codeItem.queryFailureCondition} />;
                                },
                            }} />
                        </>;
                    },
                }} />
                <Category title="请求成功" v-slots={{
                    default: () => {
                        return <>
                            <ContentItem v-slots={{
                                content: () => {
                                    return <FCheckbox v-model={props.codeItem.showSuccessToaster}>展示成功的信息在成功的时候</FCheckbox>;
                                },
                            }} />
                            <ContentItem label="成功信息" v-slots={{
                                content: () => {
                                    return <FInput v-model={props.codeItem.successMessage} />;
                                },
                            }} />
                        </>;
                    },
                }} />
            </>;
        };
    },
});
