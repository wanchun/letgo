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
import './index.less';

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

            if (canClick && typeof node.select === 'function') {
                node.select();
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
                        class="instance-node-selector-node"
                    >
                        <div class="instance-node-selector-node-content">
                            {node.title}
                        </div>
                    </div>
                );
            });
            return children;
        };

        return () => {
            return (
                <div class="instance-node-selector">
                    <FPopper
                        v-slots={{
                            trigger: () => {
                                return (
                                    <div class="instance-node-selector-current">
                                        {node.title}
                                    </div>
                                );
                            },
                        }}
                    >
                        <div class="instance-node-selector">
                            {renderNodes()}
                        </div>
                    </FPopper>
                </div>
            );
        };
    },
});

export default NodeSelectorView;
