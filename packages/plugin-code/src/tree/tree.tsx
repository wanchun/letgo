import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import TreeNode from './tree-node';

export default defineComponent({
    props: {
        value: {
            type: Object as PropType<any>,
        },
    },
    setup(props) {
        return () => {
            <div>
                {
                    Object.keys(props.value).map((key) => {
                        return <TreeNode label={key} level={0} value={props.value[key]} />;
                    })
                }
            </div>;
        };
    },
});
