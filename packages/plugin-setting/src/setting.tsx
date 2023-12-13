import type { PropType } from 'vue';
import { defineComponent, onBeforeUnmount, watch } from 'vue';
import { FScrollbar, FTabPane, FTabs } from '@fesjs/fes-design';
import type { SettingField } from '@webank/letgo-designer';
import {
    createSettingFieldView,
    usePopup,
} from '@webank/letgo-designer';
import { Return } from '@icon-park/vue-next';
import type { IPluginContext } from '@webank/letgo-engine-plugin';
import { SettingsMain } from './main';
import Breadcrumb from './breadcrumb';
import './setting.less'; 

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

        const { popupList, closePopup, closeAllPopup } = usePopup();

        watch(() => main.currentNode, () => {
            closeAllPopup();
        });

        return () => {
            const { settings, currentNode } = main;

            if (!settings) {
                return (
                    <div class="letgo-plg-setting">
                        <div class="letgo-plg-setting__notice">
                            <p>请在左侧画布选中节点</p>
                        </div>
                    </div>
                );
            }

            // 当节点被锁定，且未开启锁定后容器可设置属性
            if (settings.isLocked) {
                return (
                    <div class="letgo-plg-setting">
                        <div class="letgo-plg-setting__notice">
                            <p>该节点已被锁定，无法配置</p>
                        </div>
                    </div>
                );
            }

            if (Array.isArray(settings.items) && settings.items.length === 0) {
                return (
                    <div class="letgo-plg-setting">
                        <div class="letgo-plg-setting__notice">
                            <p>该组件暂无配置</p>
                        </div>
                    </div>
                );
            }

            if (!settings.isSameComponent) {
                return (
                    <div class="letgo-plg-setting">
                        <div class="letgo-plg-setting__notice">
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
                            <FScrollbar class="letgo-plg-setting__pane">
                                {field.items.map(item =>
                                    createSettingFieldView(item),
                                )}
                            </FScrollbar>
                        </FTabPane>
                    );
                });

            return (
                <div class="letgo-plg-setting">
                    <Breadcrumb node={currentNode}></Breadcrumb>
                    <div class="letgo-plg-setting__body">
                        <FTabs key={currentNode.id} modelValue={items[0].id}>
                            {{
                                default: renderTabs
                            }}
                        </FTabs>
                        {popupList.value.length > 0 && (
                            popupList.value.map(popup => (
                                <div class="letgo-plg-setting__popup" style={{ zIndex: popup.zIndex }}>
                                    <FScrollbar>
                                        <div class="letgo-plg-setting__popup-header">
                                            <Return theme="outline" class="letgo-plg-setting__icon" onClick={closePopup}></Return>
                                            <span>
                                                {popup.title}
                                            </span>
                                        </div>
                                        {popup.nodes}
                                    </FScrollbar>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        };
    },
});
