import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { FSelect } from '@fesjs/fes-design';
import type { IJavascriptQuery } from '@webank/letgo-types';
import { ResourceType } from '@webank/letgo-types';
import ContentItem from './content-item';
import { wrapCls } from './resource.css';

const Options = [{
    value: ResourceType.RESTQuery,
    label: 'REST API',
}, {
    value: ResourceType.Query,
    label: '自定义查询逻辑',
}];

export default defineComponent({
    name: 'Resource',
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
    },
    setup(props) {
        return () => {
            return <div class={wrapCls}>
                <ContentItem label="类型" labelStyle="width: 80px" v-slots={{
                    content: () => {
                        return <FSelect v-model={props.codeItem.resourceType} options={Options} />;
                    },
                }} />
            </div>;
        };
    },
});
