import { RightOutlined } from '@fesjs/fes-design/icon';
import { type INode, canClickNode } from '@webank/letgo-designer';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { InnerGlobalVariables } from '@webank/letgo-common';
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

        const hasCodeId = (id: string) => {
            const doc = props.node.document;
            if (doc)
                return doc.state.hasStateId(id) || doc.designer.project.code.hasCodeId(id) || InnerGlobalVariables.includes(id);

            return false;
        };

        const renderNodeRef = () => {
            return <NodeRef id={props.node.ref} hasCodeId={hasCodeId} onChange={changeNodeRef} />;
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

            const doClick = (node: INode, e: MouseEvent) => {
                const canClick = canClickNode(node, e);

                if (canClick) {
                    node.document.selection.select(node.id);
                    const editor = node.document.project.designer.editor;
                    const npm = node?.componentMeta?.npm;
                    const selected
                        = [npm?.package, npm?.exportName]
                            .filter(item => !!item)
                            .join('-')
                            || node?.componentMeta?.componentName
                            || '';
                    editor?.emit('designer.border.action', {
                        name: 'select',
                        selected,
                    });
                }
            };

            const onMouseOver = (node: INode) => {
                if (node && typeof node.hover === 'function')
                    node.hover(true);
            };

            const onMouseOut = (node: INode) => {
                if (node && typeof node.hover === 'function')
                    node.hover(false);
            };

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
                                            'letgo-plg-setting__navigator-item',
                                            isParentNode && 'letgo-plg-setting__navigator-item--parent',
                                        ]}
                                        onClick={e => isParentNode && doClick(node, e)}
                                        onMouseenter={() => {
                                            onMouseOver(node);
                                        }}
                                        onMouseleave={() => {
                                            onMouseOut(node);
                                        }}
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
