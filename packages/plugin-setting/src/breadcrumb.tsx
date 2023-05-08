import type { PropType } from 'vue';
import type { INode } from '@webank/letgo-designer';
import { RightOutlined } from '@fesjs/fes-design/icon';
import { defineComponent } from 'vue';

import {
    navigatorCls,
    navigatorItemCls,
} from './index.css';

export default defineComponent({
    name: 'Breadcrumb',
    props: {
        node: Object as PropType<INode>,
    },
    setup(props) {
        return () => {
            const node = props.node;
            const { focusNode } = node.document;
            const parentNodeList: INode[] = [];
            let _node = node;

            let l = 3;
            while (l-- > 0 && _node) {
                parentNodeList.push(_node);
                if (_node.isRoot())
                    break;

                if (_node.contains(focusNode))
                    break;

                _node = _node.parent;
            }

            const len = parentNodeList.length;

            return (
                <div class={navigatorCls}>
                    {parentNodeList
                        .reverse()
                        .map((node: INode, index: number) => {
                            const isParentNode = index < len - 1;
                            const isCurrentNode = (index === len - 1);
                            return (
                                <>
                                    <span
                                        class={[
                                            navigatorItemCls,
                                            isParentNode && 'is-parent',
                                        ]}
                                    >
                                        {node?.componentMeta?.title}
                                        {/* TODO refName 可更改 */}
                                        { isCurrentNode ? ` ( ${node.ref} )` : '' }
                                    </span>
                                    {isParentNode && (
                                        <RightOutlined></RightOutlined>
                                    )}
                                </>
                            );
                        })}
                </div>
            );
        };
    },
});
