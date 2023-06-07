import { defineComponent } from 'vue';
import { FCheckbox, FInput } from '@fesjs/fes-design';
import Category from './category';
import ContentItem from './content-item';
import FailureCondition from './failure-condition';

export default defineComponent({
    setup() {
        return () => {
            return <>
                <Category title="请求失败" v-slots={{
                    default: () => {
                        return <>
                            <ContentItem v-slots={{
                                content: () => {
                                    return <FCheckbox>展示失败的信息在失败的时候</FCheckbox>;
                                },
                            }} />
                            <ContentItem label="失败条件" v-slots={{
                                content: () => {
                                    return <FailureCondition />;
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
                                    return <FCheckbox>展示成功的信息在成功的时候</FCheckbox>;
                                },
                            }} />
                            <ContentItem label="成功信息" v-slots={{
                                content: () => {
                                    return <FInput />;
                                },
                            }} />
                        </>;
                    },
                }} />
            </>;
        };
    },
});
