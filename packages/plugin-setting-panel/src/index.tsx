import { defineComponent, PropType, computed } from 'vue';
import { RightOutlined } from '@fesjs/fes-design/icon';
import { FTabs, FTabPane } from '@fesjs/fes-design';
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

        return () => {
            const parentNodeList: Node[] = [];
            let _node = node;

            let l = 3;
            while (l-- > 0 && _node) {
                parentNodeList.push(_node);
                if (_node.isRoot()) {
                    break;
                }
                if (_node.contains(focusNode)) {
                    break;
                }
                _node = _node.parent;
            }

            return (
                <div class="letgo-setter-navigator">
                    {parentNodeList.map((node: Node, index: number) => {
                        return (
                            <>
                                <span class={'letgo-setter-navigator-item'}>
                                    {node?.componentMeta?.title}
                                </span>
                                {index < parentNodeList.length - 1 && (
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
                    <Breadcrumb node={node}></Breadcrumb>
                    <div class="letgo-setter-body">
                        <FTabs>
                            <FTabPane
                                name="属性"
                                value="props"
                                displayDirective="show"
                            ></FTabPane>
                            <FTabPane
                                name="样式"
                                value="卫衣"
                                displayDirective="show"
                            ></FTabPane>
                            <FTabPane
                                name="高级"
                                value="configure"
                                displayDirective="show"
                            ></FTabPane>
                        </FTabs>
                    </div>
                </div>
            );
        };
    },
});
