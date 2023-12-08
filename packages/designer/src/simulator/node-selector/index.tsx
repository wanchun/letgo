import type {
    PropType,
    ShallowRef,
} from 'vue';
import {
    defineComponent,
    onMounted,
    shallowRef,
} from 'vue';
import { FPopper } from '@fesjs/fes-design';
import { canClickNode } from '../../utils';
import type { INode } from '../../types';
import './index.less';

type UnionNode = INode | null;

const NodeSelectorView = defineComponent({
    name: 'NodeSelectorView',
    props: {
        node: Object as PropType<INode>,
    },
    setup(props) {
        const { node } = props;

        const parentNodes: ShallowRef<INode[]> = shallowRef([]);

        const getParentNodes = (node: INode) => {
            const parentNodes: INode[] = [];
            const { focusNode } = node.document;

            if (node.contains(focusNode) || !focusNode.contains(node))
                return parentNodes;

            let currentNode: UnionNode = node;

            while (currentNode && parentNodes.length < 5) {
                currentNode = currentNode.parent;
                if (currentNode)
                    parentNodes.push(currentNode);

                if (currentNode === focusNode)
                    break;
            }
            return parentNodes;
        };

        onMounted(() => {
            parentNodes.value = getParentNodes(node);
        });

        const onSelect = (node: INode, e: MouseEvent) => {
            if (!node)
                return;

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

        const renderNodes = () => {
            const nodes = parentNodes.value;
            if (!nodes || nodes.length < 1)
                return null;

            const children = nodes.map((node, key) => {
                return (
                    <div
                        key={key}
                        onClick={(e: MouseEvent) => {
                            onSelect(node, e);
                        }}
                        onMouseenter={() => {
                            onMouseOver(node);
                        }}
                        onMouseleave={() => {
                            onMouseOut(node);
                        }}
                        class="letgo-simulator-selector__node"
                    >
                        <div class="letgo-simulator-selector__node-content">{node.title}</div>
                    </div>
                );
            });
            return children;
        };

        return () => {
            return (
                <div class="letgo-simulator-selector">
                    <FPopper>
                        {{
                            default: renderNodes,
                            trigger: () => {
                                return (
                                    <div class="letgo-simulator-selector__trigger">{node.title}</div>
                                );
                            },
                        }}
                    </FPopper>
                </div>
            );
        };
    },
});

export default NodeSelectorView;
