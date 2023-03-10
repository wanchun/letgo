import {
    defineComponent,
    PropType,
    onMounted,
    ShallowRef,
    shallowRef,
} from 'vue';
import { FPopper } from '@fesjs/fes-design';
import { canClickNode } from '../../utils';
import { Node } from '../../node';
import { ParentalNode } from '../../types';
import { wrapperCls, triggerCls, nodeCls, nodeContentCls } from './index.css';

type UnionNode = Node | ParentalNode | null;

const NodeSelectorView = defineComponent({
    name: 'NodeSelectorView',
    props: {
        node: Object as PropType<Node>,
    },
    setup(props) {
        const { node } = props;

        const parentNodes: ShallowRef<Node[]> = shallowRef([]);

        const getParentNodes = (node: Node) => {
            const parentNodes: Node[] = [];
            const { focusNode } = node.document;

            if (node.contains(focusNode) || !focusNode.contains(node)) {
                return parentNodes;
            }

            let currentNode: UnionNode = node;

            while (currentNode && parentNodes.length < 5) {
                currentNode = currentNode.parent;
                if (currentNode) {
                    parentNodes.push(currentNode);
                }
                if (currentNode === focusNode) {
                    break;
                }
            }
            return parentNodes;
        };

        onMounted(() => {
            parentNodes.value = getParentNodes(node);
        });

        const onSelect = (node: Node, e: MouseEvent) => {
            if (!node) {
                return;
            }

            const canClick = canClickNode(node, e);

            if (canClick) {
                node.document.selection.select(node.id);
                const editor = node.document.project.designer.editor;
                const npm = node?.componentMeta?.npm;
                const selected =
                    [npm?.package, npm?.componentName]
                        .filter((item) => !!item)
                        .join('-') ||
                    node?.componentMeta?.componentName ||
                    '';
                editor?.emit('designer.border.action', {
                    name: 'select',
                    selected,
                });
            }
        };

        const onMouseOver = (node: Node) => {
            if (node && typeof node.hover === 'function') {
                node.hover(true);
            }
        };

        const onMouseOut = (node: Node) => {
            if (node && typeof node.hover === 'function') {
                node.hover(false);
            }
        };

        const renderNodes = () => {
            const nodes = parentNodes.value;
            if (!nodes || nodes.length < 1) {
                return null;
            }
            const children = nodes.map((node, key) => {
                return (
                    <div
                        key={key}
                        onClick={(e: MouseEvent) => {
                            onSelect(node, e);
                        }}
                        onMouseEnter={() => {
                            onMouseOver(node);
                        }}
                        onMouseLeave={() => {
                            onMouseOut(node);
                        }}
                        class={nodeCls}
                    >
                        <div class={nodeContentCls}>{node.title}</div>
                    </div>
                );
            });
            return children;
        };

        return () => {
            return (
                <div class={wrapperCls}>
                    <FPopper>
                        {{
                            default: renderNodes,
                            trigger: () => {
                                return (
                                    <div class={triggerCls}>{node.title}</div>
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
