import { defineComponent, PropType, computed } from 'vue';
import { RightOutlined } from '@fesjs/fes-design/icon';
import './index.less';
import type { Node } from '@webank/letgo-designer';
import type { IPluginContext } from '@webank/letgo-engine';

const Breadcrumb = defineComponent({
    name: 'Breadcrumb',
    props: {
        node: Object as PropType<Node>,
    },
    setup(props) {
        const node = props.node;
        const { focusNode } = node.document;
        const parentNodeList = computed(() => {
            let _node = node;
            const items = [];
            let l = 3;
            while (l-- > 0 && _node) {
                if (node.isRoot()) {
                    break;
                }
                if (node.contains(focusNode)) {
                    l = 0;
                }
                items.push(node);
                _node = node.parent;
            }
            return items;
        });

        const getName = (node: Node) => {
            const npm = node?.componentMeta?.npm;
            return (
                [npm?.package, npm?.componentName]
                    .filter((item) => !!item)
                    .join('-') ||
                node?.componentMeta?.componentName ||
                ''
            );
        };

        return () => {
            return parentNodeList.value.map((node: Node, index: number) => {
                return (
                    <div class="letgo-setter-navigator">
                        <span>{getName(node)}</span>
                        {index < parentNodeList.value.length - 1 && (
                            <RightOutlined></RightOutlined>
                        )}
                    </div>
                );
            });
        };
    },
});

export default defineComponent({
    name: 'PluginSetter',
    props: {
        ctx: {
            type: Object as PropType<IPluginContext>,
        },
    },
    setup(props) {
        const { designer } = props.ctx;

        const selecting = computed(() => {
            return designer.currentSelection.getNodes();
        });

        return () => {
            if (!selecting.value || selecting.value.length < 1) {
                return (
                    <div class="letgo-setter-main">
                        <div class="letgo-setter-notice">
                            <p>请在左侧画布选中节点</p>
                        </div>
                    </div>
                );
            }

            const node = selecting.value[0];

            // 当节点被锁定，且未开启锁定后容器可设置属性
            if (node.isLocked) {
                return (
                    <div class="letgo-setter-main">
                        <div class="letgo-setter-notice">
                            <p>该节点已被锁定，无法配置</p>
                        </div>
                    </div>
                );
            }

            return (
                <div class="letgo-setter-main">
                    <Breadcrumb node={node}></Breadcrumb>;
                    <div class="letgo-setter-body"></div>
                </div>
            );
        };
    },
});
