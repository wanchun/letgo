import { defineComponent, PropType, onBeforeUnmount } from 'vue';
import { FTabs, FTabPane } from '@fesjs/fes-design';
import { RightOutlined } from '@fesjs/fes-design/icon';
import {
    Node,
    SettingField,
    createSettingFieldView,
} from '@webank/letgo-designer';
import { IPluginContext } from '@webank/letgo-plugin-manager';
import { SettingsMain } from './main';
import {
    mainCls,
    navigatorCls,
    bodyCls,
    noticeCls,
    navigatorItemCls,
    paneWrapperCls,
} from './index.css';

const Breadcrumb = defineComponent({
    name: 'Breadcrumb',
    props: {
        node: Object as PropType<Node>,
    },
    setup(props) {
        return () => {
            const node = props.node;
            const { focusNode } = node.document;
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

        console.log('SettingsMain:', main);

        onBeforeUnmount(() => {
            main?.purge();
        });

        return () => {
            const { settings, currentNode } = main;

            if (!settings) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>??????????????????????????????</p>
                        </div>
                    </div>
                );
            }

            // ???????????????????????????????????????????????????????????????
            if (settings.isLocked) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>????????????????????????????????????</p>
                        </div>
                    </div>
                );
            }

            if (Array.isArray(settings.items) && settings.items.length === 0) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>?????????????????????</p>
                        </div>
                    </div>
                );
            }

            if (!settings.isSameComponent) {
                return (
                    <div class={mainCls}>
                        <div class={noticeCls}>
                            <p>?????????????????????????????????</p>
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
                            <div class={paneWrapperCls}>
                                {field.items.map((item) =>
                                    createSettingFieldView(item),
                                )}
                            </div>
                        </FTabPane>
                    );
                });

            return (
                <div class={mainCls}>
                    <Breadcrumb node={currentNode}></Breadcrumb>
                    <div class={bodyCls}>
                        <FTabs key={currentNode.id} modelValue={items[0].id}>
                            {renderTabs()}
                        </FTabs>
                    </div>
                </div>
            );
        };
    },
});
