import type { PropType } from 'vue';
import type { INode } from '@webank/letgo-designer';
import { RightOutlined } from '@fesjs/fes-design/icon';
import { defineComponent } from 'vue';
import NodeRef from './node-ref';

export default defineComponent({
    name: 'Breadcrumb',
    props: {
        node: Object as PropType<INode>,
    },
    setup(props) {
        const changeNodeRef = (ref: string) => {
            props.node.changeRef(ref);
        };
        const renderNodeRef = () => {
            return <NodeRef id={props.node.ref} onChange={changeNodeRef} />;
        };

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
                <div class="letgo-plg-setting__navigator">
                    {parentNodeList
                        .reverse()
                        .map((node: INode, index: number) => {
                            const isParentNode = index < len - 1;
                            const isCurrentNode = (index === len - 1);
                            return (
                                <>
                                    <span
                                        class={[
                                            "letgo-plg-setting__navigator-item",
                                            isParentNode && 'letgo-plg-setting__navigator-item--parent',
                                        ]}
                                    >
                                        {node?.componentMeta?.title}
                                        {/* TODO refName 可更改 */}
                                        { isCurrentNode ? renderNodeRef() : '' }
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
