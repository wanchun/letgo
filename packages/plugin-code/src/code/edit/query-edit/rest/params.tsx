import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IRestQueryResource } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import { FCheckbox, FSelect } from '@fesjs/fes-design';
import { CodeEditor, ExpressionEditor } from '@webank/letgo-components';
import { javascript } from '@codemirror/lang-javascript';
import ContentItem from '../content-item';
import './params.less';

const MethodOptions = [{
    label: 'POST',
    value: 'POST',
}, {
    label: 'GET',
    value: 'GET',
}];

export default defineComponent({
    name: 'RESTParams',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        codeItem: Object as PropType<IRestQueryResource>,
        changeCodeItem: Function as PropType<(content: Partial<IRestQueryResource>) => void>,
    },
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

        return () => {
            return (
                <div>
                    <ContentItem
                        label="请求方法"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return (
                                    <div class="letgo-plg-code__query-params-content">
                                        <FSelect class="letgo-plg-code__query-method" placeholder="" v-model={props.codeItem.method} options={MethodOptions} />
                                        <ExpressionEditor
                                            placeholder="/api/path/to/get/data"
                                            class="letgo-plg-code__query-api"
                                            doc={props.codeItem.api}
                                            onChangeDoc={changeApiPath}
                                        />
                                    </div>
                                );
                            },
                        }}
                    />

                    <ContentItem
                        label="请求参数"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return <ExpressionEditor style="width: 0; flex: 1;" placeholder="params" doc={props.codeItem.params} onChangeDoc={changeParams} />;
                            },
                        }}
                    />

                    <ContentItem
                        label="数据转换"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return (
                                    <div style="width: 0; flex: 1;">
                                        <FCheckbox v-model={props.codeItem.enableTransformer}>开启数据转换</FCheckbox>
                                        {!props.codeItem.enableTransformer && <p class="letgo-plg-code__query-tip">开始数据转换，将请求数据转换成不同的格式</p>}
                                        {props.codeItem.enableTransformer && <CodeEditor extensions={[javascript()]} doc={props.codeItem.transformer} changeDoc={changeTransformer} />}
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
