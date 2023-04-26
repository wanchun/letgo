import type { PropType } from 'vue';
import type { Node } from '@webank/letgo-designer';
import { defineComponent } from 'vue';

import {
    navigatorCls,
} from './index.css';

export default defineComponent({
    name: 'ComponentKey',
    props: {
        node: Object as PropType<Node>,
    },
    setup(props) {
        return () => {
            const node = props.node;
            // TODO 鼠标 hover 上去能对名字进行变更
            return (
                <div class={navigatorCls}>
                    {node.id}
                </div>
            );
        };
    },
});
