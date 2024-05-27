import { defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { isRestQueryResource } from '@webank/letgo-types';
import { isEqual } from 'lodash-es';
import type { IJavascriptQuery, IRestQueryResource } from '@webank/letgo-types';
import { FCheckbox, FInputNumber, FOption, FSelect } from '@fesjs/fes-design';
import { ExpressionEditor } from '@webank/letgo-components';
import ContentItem from '../../content-item';
import Category from './category';
import './advance.less';

export default defineComponent({
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const innerCodeItem = ref<IJavascriptQuery>(props.codeItem);

        watch(() => props.codeItem, () => {
            if (!isEqual(props.codeItem, innerCodeItem.value))
                innerCodeItem.value = props.codeItem;
        });
        watch(innerCodeItem, () => {
            const { id: _id, ...content } = innerCodeItem.value;
            props.changeCodeItem(content);
        }, {
            deep: true,
        });

        const renderCacheDuration = () => {
            if (innerCodeItem.value.enableCaching) {
                return (
                    <div class="letgo-plg-code__query-cache-info">
                        <label>缓存时间:</label>
                        <FInputNumber
                            v-model={innerCodeItem.value.cacheDuration}
                            placeholder="非必填"
                            v-slots={{
                                suffix() {
                                    return '秒';
                                },
                            }}

                        />
                    </div>
                );
            }
            return null;
        };

        const renderCacheType = () => {
            if (innerCodeItem.value.enableCaching) {
                return (
                    <div class="letgo-plg-code__query-cache-info">
                        <label>缓存类型:</label>
                        <FSelect v-model={innerCodeItem.value.cacheType}>
                            <FOption value="ram">内存</FOption>
                            <FOption value="sessionStorage">会话</FOption>
                            <FOption value="localStorage">本地</FOption>
                        </FSelect>
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

        const changeQueryDisabled = (queryDisabled: string) => {
            props.changeCodeItem({
                queryDisabled,
            });
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
                                                return (
                                                    <FInputNumber
                                                        v-model={innerCodeItem.value.queryTimeout}
                                                        placeholder="设置执行超时时间"
                                                        v-slots={{
                                                            suffix() {
                                                                return '秒';
                                                            },
                                                        }}
                                                    >
                                                    </FInputNumber>
                                                );
                                            },
                                        }}
                                    />
                                    <ContentItem
                                        label="缓存"
                                        v-slots={{
                                            content: () => {
                                                return (
                                                    <div class="letgo-plg-code__query-cache">
                                                        <FCheckbox v-model={innerCodeItem.value.enableCaching}>缓存请求结果</FCheckbox>
                                                        {renderCacheType()}
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
                                                return <FCheckbox v-model={innerCodeItem.value.runWhenPageLoads}>进入页面时自动执行</FCheckbox>;
                                            },
                                        }}
                                    />
                                    <ContentItem
                                        label="禁止执行"
                                        v-slots={{
                                            content: () => {
                                                return (
                                                    <ExpressionEditor
                                                        hints={props.hints}
                                                        style="width: 0; flex: 1;"
                                                        placeholder="pageName !== 'login'"
                                                        doc={innerCodeItem.value.queryDisabled}
                                                        onChange={changeQueryDisabled}
                                                    />
                                                );
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
