import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { IJavascriptQuery } from '@webank/letgo-types';
import { FCheckbox, FInputNumber } from '@fesjs/fes-design';
import Category from './category';
import ContentItem from './content-item';

export default defineComponent({
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
    },
    setup(props) {
        return () => {
            return <>
                <Category title="其他配置" v-slots={{
                    default: () => {
                        return <>
                            <ContentItem label="超时时间" v-slots={{
                                content: () => {
                                    return <FInputNumber v-model={props.codeItem.queryTimeout} placeholder="设置执行超时时间" />;
                                },
                            }} />
                            <ContentItem label="缓存" v-slots={{
                                content: () => {
                                    return <FCheckbox v-model={props.codeItem.enableCaching}>缓存请求结果</FCheckbox>;
                                },
                            }} />
                        </>;
                    },
                }} />
            </>;
        };
    },
});
