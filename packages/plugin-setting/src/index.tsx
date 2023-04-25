import type { PropType } from 'vue';
import { defineComponent, onBeforeUnmount } from 'vue';
import { FTabPane, FTabs } from '@fesjs/fes-design';
import type { SettingField } from '@webank/letgo-designer';
import {
    createSettingFieldView,
} from '@webank/letgo-designer';
import type { IPluginContext } from '@webank/letgo-plugin-manager';
import { SettingsMain } from './main';
import Breadcrumb from './breadcrumb';
import ComponentKey from './component-key';
import {
    bodyCls,
    mainCls,
    noticeCls,
    paneWrapperCls,
} from './index.css';

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
                            <div class={paneWrapperCls}>
                                {field.items.map(item =>
                                    createSettingFieldView(item),
                                )}
                            </div>
                        </FTabPane>
                    );
                });

            return (
                <div class={mainCls}>
                    <ComponentKey node={currentNode} />
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
