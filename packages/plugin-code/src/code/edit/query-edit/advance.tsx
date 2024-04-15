import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { isRestQueryResource } from '@webank/letgo-types';
import type { IJavascriptQuery, IRestQueryResource } from '@webank/letgo-types';
import { FCheckbox, FInputNumber } from '@fesjs/fes-design';
import { ExpressionEditor } from '@webank/letgo-components';
import Category from './category';
import ContentItem from './content-item';
import './advance.less';

export default defineComponent({
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IRestQueryResource>) => void>,
    },
    setup(props) {
        const renderCacheDuration = () => {
            if (props.codeItem.enableCaching) {
                return (
                    <div class="letgo-plg-code__query-cache-time">
                        <label>缓存时间(单位:秒):</label>
                        <FInputNumber v-model={props.codeItem.cacheDuration} />
                    </div>
                );
            }
            return null;
        };

        const changeHeaders = (header: string) => {
            props.changeCodeItem({
                headers: {
                    type: 'JSExpression',
                    value: header,
                },
            });
        };
        const renderHeaders = () => {
            if (isRestQueryResource(props.codeItem)) {
                return (
                    <ContentItem
                        label="请求头"
                        v-slots={{
                            content: () => {
                                return (
                                    <ExpressionEditor
                                        hints={props.hints}
                                        style="width: 0; flex: 1;"
                                        placeholder="{}"
                                        doc={(props.codeItem as IRestQueryResource).headers?.value}
                                        onChange={changeHeaders}
                                    />
                                );
                            },
                        }}
                    />
                );
            }

            return null;
        };

        return () => {
            return (
                <>
                    <Category v-slots={{
                        default: () => {
                            return (
                                <>
                                    {renderHeaders()}
                                    <ContentItem
                                        label="超时时间"
                                        v-slots={{
                                            content: () => {
                                                return <FInputNumber v-model={props.codeItem.queryTimeout} placeholder="设置执行超时时间" />;
                                            },
                                        }}
                                    />
                                    <ContentItem
                                        label="缓存"
                                        v-slots={{
                                            content: () => {
                                                return (
                                                    <div class="letgo-plg-code__query-cache">
                                                        <FCheckbox v-model={props.codeItem.enableCaching}>缓存请求结果</FCheckbox>
                                                        {renderCacheDuration()}
                                                    </div>
                                                );
                                            },
                                        }}
                                    />
                                    <ContentItem
                                        label="页面加载"
                                        v-slots={{
                                            content: () => {
                                                return <FCheckbox v-model={props.codeItem.runWhenPageLoads}>进入页面时自动执行</FCheckbox>;
                                            },
                                        }}
                                    />
                                </>
                            );
                        },
                    }}
                    />
                </>
            );
        };
    },
});
