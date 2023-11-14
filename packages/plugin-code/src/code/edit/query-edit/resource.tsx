import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { FSelect } from '@fesjs/fes-design';
import type { IJavascriptQuery } from '@harrywan/letgo-types';
import { ResourceType } from '@harrywan/letgo-types';
import ContentItem from './content-item';
import { contentCls, wrapCls } from './resource.css';

const Options = [{
    value: ResourceType.RESTQuery,
    label: 'REST API',
}, {
    value: ResourceType.Query,
    label: '自定义查询逻辑',
}];

// const RunOptions = [{
//     value: RunCondition.Manual,
//     label: '手动触发 trigger 执行',
// }, {
//     value: RunCondition.DependStateChange,
//     label: '依赖状态变更自动执行',
// }];

export default defineComponent({
    name: 'Resource',
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
    },
    setup(props) {
        return () => {
            return (
                <div class={wrapCls}>
                    <ContentItem label="类型" labelStyle="width: 72px" v-slots={{
                        content: () => {
                            return (
                                <div class={contentCls}>
                                    <FSelect style="width: 130px" v-model={props.codeItem.resourceType} options={Options} />
                                </div>
                            );
                        },
                    }} />
                </div>
            );
        };
    },
});
