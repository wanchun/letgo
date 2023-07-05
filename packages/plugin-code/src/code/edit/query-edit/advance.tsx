import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { IJavascriptQuery } from '@webank/letgo-types';
import { FCheckbox, FInputNumber } from '@fesjs/fes-design';
import Category from './category';
import ContentItem from './content-item';
import { cacheDurationCls } from './advance.css';

export default defineComponent({
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
    },
    setup(props) {
        const renderCacheDuration = () => {
            if (props.codeItem.enableCaching) {
                return <div class={cacheDurationCls}>
                    <label>缓存时间(单位:秒):</label>
                    <FInputNumber v-model={props.codeItem.cacheDuration} />
                </div>;
            }
            return null;
        };

        return () => {
            return <>
                <Category v-slots={{
                    default: () => {
                        return <>
                            <ContentItem label="超时时间" v-slots={{
                                content: () => {
                                    return <FInputNumber v-model={props.codeItem.queryTimeout} placeholder="设置执行超时时间" />;
                                },
                            }} />
                            <ContentItem label="缓存" v-slots={{
                                content: () => {
                                    return <div>
                                        <FCheckbox v-model={props.codeItem.enableCaching}>缓存请求结果</FCheckbox>
                                        {renderCacheDuration()}
                                    </div>;
                                },
                            }} />
                            <ContentItem label="页面加载" v-slots={{
                                content: () => {
                                    return <FCheckbox v-model={props.codeItem.runWhenPageLoads}>进入页面时自动执行</FCheckbox>;
                                },
                            }} />
                        </>;
                    },
                }} />
            </>;
        };
    },
});
