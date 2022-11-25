import { defineComponent, PropType, computed } from 'vue';
import { RightOutlined } from '@fesjs/fes-design/icon';
import { FTabs, FTabPane } from '@fesjs/fes-design';
import { Node } from '@webank/letgo-designer';
import { IPluginContext } from '@webank/letgo-plugin-manager';
import {
    mainCls,
    navigatorCls,
    bodyCls,
    noticeCls,
    navigatorItemCls,
} from './index.css';

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

            const len = parentNodeList.length;

            return (
                <div class={navigatorCls}>
                    {parentNodeList
                        .reverse()
                        .map((node: Node, index: number) => {
                            const isParentNode = index < len - 1;
                            return (
                                <>
                                    <span
                                        class={[
                                            navigatorItemCls,
                                            isParentNode && 'is-parent',
                                        ]}
                                    >
                                        {node?.componentMeta?.title}
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
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>请在左侧画布选中节点</p>
                        </div>
                    </div>
                );
            }

            const node = selecting.value[0];

            // 当节点被锁定，且未开启锁定后容器可设置属性
            if (node.isLocked) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>该节点已被锁定，无法配置</p>
                        </div>
                    </div>
                );
            }

            return (
                <div class={mainCls}>
                    <Breadcrumb node={node}></Breadcrumb>
                    <div class={bodyCls}>
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
