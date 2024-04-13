import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { FSelect } from '@fesjs/fes-design';
import type { IJavascriptQuery } from '@webank/letgo-types';
import { IEnumResourceType } from '@webank/letgo-types';
import ContentItem from './content-item';
import './resource.less';

const Options = [{
    value: IEnumResourceType.RESTQuery,
    label: 'REST API',
}, {
    value: IEnumResourceType.Query,
    label: '自定义查询逻辑',
}];

// const RunOptions = [{
//     value: IEnumRunCondition.Manual,
//     label: '手动触发 trigger 执行',
// }, {
//     value: IEnumRunCondition.DependStateChange,
//     label: '依赖状态变更自动执行',
// }];

export default defineComponent({
    name: 'Resource',
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const changeResourceType = (val: IEnumResourceType) => {
            props.changeCodeItem({
                resourceType: val,
            });
        };

        return () => {
            return (
                <div class="letgo-plg-code__query-resource">
                    <ContentItem
                        label="类型"
                        labelStyle="width: 72px"
                        v-slots={{
                            content: () => {
                                return (
                                    <div class="letgo-plg-code__query-resource-content">
                                        <FSelect style="width: 130px" v-model={props.codeItem.resourceType} onChange={changeResourceType} options={Options} />
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
