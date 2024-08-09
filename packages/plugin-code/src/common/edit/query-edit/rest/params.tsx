import type { ExtractPropTypes, PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IPublicModelProject, IRestQueryResource } from '@webank/letgo-types';
import { FCheckbox, FSelect } from '@fesjs/fes-design';
import { CodeEditor, ExpressionEditor } from '@webank/letgo-components';
import ContentItem from '../../../content-item';
import './params.less';

const MethodOptions = [{
    label: 'POST',
    value: 'POST',
}, {
    label: 'GET',
    value: 'GET',
}, {
    label: 'PUT',
    value: 'PUT',
}, {
    label: 'PATCH',
    value: 'PATCH',
}, {
    label: 'DELETE',
    value: 'DELETE',
}, {
    label: 'HEAD',
    value: 'HEAD',
}, {
    label: 'OPTIONS',
    value: 'OPTIONS',
}, {
    label: 'TRACE',
    value: 'TRACE',
}];

const paramsProps = {
    isGlobal: Boolean,
    project: Object as PropType<IPublicModelProject>,
    hints: Object as PropType<Record<string, any>>,
    codeItem: Object as PropType<IRestQueryResource>,
    changeCodeItem: Function as PropType<(content: Partial<IRestQueryResource>) => void>,
} as const;

export type ParamsProps = ExtractPropTypes<typeof paramsProps>;

export default defineComponent({
    name: 'RESTParams',
    props: paramsProps,
    setup(props) {
        const changeApiPath = (newApi: string) => {
            props.changeCodeItem({
                api: newApi,
            });
        };

        const changeParams = (newParams: string) => {
            props.changeCodeItem({
                params: newParams,
            });
        };

        const changeTransformer = (code: string) => {
            props.changeCodeItem({
                transformer: code,
            });
        };

        const onApiInputBlur = (api: string) => {
            if (api) {
                api = api.trim();
                if (/^[\/]?\w+\//.test(api)) {
                    api = api.replace(/\s/g, '');
                    changeApiPath(JSON.stringify(api));
                }
            }
        };

        return () => {
            return (
                <div>
                    <ContentItem
                        key={`api_${props.codeItem.id}`}
                        label="请求方法"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return (
                                    <div class="letgo-plg-code__query-params-content">
                                        <FSelect class="letgo-plg-code__query-method" placeholder="" v-model={props.codeItem.method} options={MethodOptions} />
                                        <ExpressionEditor
                                            hints={props.hints}
                                            placeholder="/api/path/to/get/data"
                                            class="letgo-plg-code__query-api"
                                            doc={props.codeItem.api}
                                            onBlur={onApiInputBlur}
                                            onChange={changeApiPath}
                                            id={`api_${props.codeItem.id}`}
                                        />
                                    </div>
                                );
                            },
                        }}
                    />

                    <ContentItem
                        key={`params_${props.codeItem.id}`}
                        label="请求参数"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return (
                                    <ExpressionEditor
                                        hints={props.hints}
                                        style="width: 0; flex: 1;"
                                        placeholder="params"
                                        doc={props.codeItem.params}
                                        onChange={changeParams}
                                        id={`params_${props.codeItem.id}`}
                                    />
                                );
                            },
                        }}
                    />

                    <ContentItem
                        key={`transform_${props.codeItem.id}`}
                        label="数据转换"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return (
                                    <div style="width: 0; flex: 1;">
                                        <FCheckbox v-model={props.codeItem.enableTransformer}>开启数据转换</FCheckbox>
                                        {!props.codeItem.enableTransformer && <p class="letgo-plg-code__query-tip">开始数据转换，将请求数据转换成不同的格式</p>}
                                        {
                                        props.codeItem.enableTransformer
                                        && (
                                            <CodeEditor
                                                hints={props.hints}
                                                doc={props.codeItem.transformer}
                                                id={`transform_${props.codeItem.id}`}
                                                onChange={changeTransformer}
                                            />
                                        )
                                        }
                                    </div>
                                );
                            },
                        }}
                    />
                </div>
            );
        };
    },
});
