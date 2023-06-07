import { defineComponent } from 'vue';
import { FCheckbox, FInputNumber } from '@fesjs/fes-design';
import Category from './category';
import ContentItem from './content-item';

export default defineComponent({
    setup() {
        return () => {
            return <>
                <Category title="其他配置" v-slots={{
                    default: () => {
                        return <>
                            <ContentItem label="超时时间" v-slots={{
                                content: () => {
                                    return <FInputNumber placeholder="设置执行超时时间" />;
                                },
                            }} />
                            <ContentItem label="缓存" v-slots={{
                                content: () => {
                                    return <FCheckbox>缓存请求结果</FCheckbox>;
                                },
                            }} />
                        </>;
                    },
                }} />
            </>;
        };
    },
});
