import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import { isFunction } from 'lodash-es';
import TreeNode from './tree-node';
import { treeCls } from './tree.css';

export default defineComponent({
    name: 'Tree',
    props: {
        value: {
            type: Object as PropType<any>,
        },
    },
    setup(props) {
        return () => {
            return <div class={treeCls}>
                {
                    props.value && Object.keys(props.value).map((key) => {
                        if (isFunction(props.value[key]))
                            return null;

                        return <TreeNode label={key} level={0} value={props.value[key]} />;
                    })
                }
            </div>;
        };
    },
});
