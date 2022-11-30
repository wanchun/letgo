import { defineComponent, PropType, onBeforeUnmount } from 'vue';
import { FTabs, FTabPane } from '@fesjs/fes-design';
import { RightOutlined } from '@fesjs/fes-design/icon';
import { Node, SettingField } from '@webank/letgo-designer';
import { IPluginContext } from '@webank/letgo-plugin-manager';
import { SettingsMain } from './main';
import SettingPane from './pane';
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
    name: 'PluginSetterPanelView',
    props: {
        ctx: {
            type: Object as PropType<IPluginContext>,
        },
    },
    setup(props) {
        const { designer, editor } = props.ctx;

        const main = new SettingsMain(editor, designer);

        onBeforeUnmount(() => {
            main?.purge();
        });

        return () => {
            const { settings, currentNode } = main;

            if (!settings) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>请在左侧画布选中节点</p>
                        </div>
                    </div>
                );
            }

            // 当节点被锁定，且未开启锁定后容器可设置属性
            if (settings.isLocked) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>该节点已被锁定，无法配置</p>
                        </div>
                    </div>
                );
            }

            if (Array.isArray(settings.items) && settings.items.length === 0) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>该组件暂无配置</p>
                        </div>
                    </div>
                );
            }

            if (!settings.isSameComponent) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>请选中同一类型节点编辑</p>
                        </div>
                    </div>
                );
            }

            const { items } = settings;

            const renderTabs = () =>
                (items as SettingField[]).map((field) => {
                    return (
                        <FTabPane
                            name={field.title}
                            value={field.id}
                            key={field.id}
                            displayDirective="show"
                        >
                            <SettingPane field={field}></SettingPane>
                        </FTabPane>
                    );
                });

            return (
                <div class={mainCls}>
                    <Breadcrumb
                        key={currentNode.id}
                        node={currentNode}
                    ></Breadcrumb>
                    <div class={bodyCls}>
                        <FTabs>{renderTabs()}</FTabs>
                    </div>
                </div>
            );
        };
    },
});
