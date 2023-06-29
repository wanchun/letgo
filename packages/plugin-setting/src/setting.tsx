import type { PropType, VNodeChild } from 'vue';
import { defineComponent, onBeforeUnmount, provide, shallowRef, triggerRef } from 'vue';
import { FScrollbar, FTabPane, FTabs } from '@fesjs/fes-design';
import type { SettingField } from '@webank/letgo-designer';
import {
    createSettingFieldView,
} from '@webank/letgo-designer';
import { Return } from '@icon-park/vue-next';
import type { IPluginContext } from '@webank/letgo-engine-plugin';
import { SettingsMain } from './main';
import Breadcrumb from './breadcrumb';
import {
    bodyCls,
    iconCls,
    mainCls,
    noticeCls,
    paneWrapperCls,
    popupHeader,
    popupWrapperCls,
} from './setting.css';

interface Popup {
    id: number
    title: string
    nodes: VNodeChild
    zIndex: number
}

let zIndex = 1;

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

        const popupList = shallowRef<Popup[]>([]);

        const popupTitle = shallowRef();

        const openPopup = (title: string, nodes: VNodeChild) => {
            popupList.value.push({
                id: Date.now(),
                title,
                nodes,
                zIndex: zIndex++,

            });
            triggerRef(popupList);
        };

        const closePopup = () => {
            popupList.value.splice(popupList.value.length - 1, 1);
            triggerRef(popupList);
        };

        provide('popup', {
            openPopup,
            closePopup,
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
                            <FScrollbar class={paneWrapperCls}>
                                {field.items.map(item =>
                                    createSettingFieldView(item),
                                )}
                            </FScrollbar>
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
                        {popupList.value.length > 0 && (
                            popupList.value.map(popup => (
                                <div class={popupWrapperCls} style={{ zIndex: popup.zIndex }}>
                                    <FScrollbar>
                                        <div class={popupHeader}>
                                            <Return theme="outline" class={iconCls} onClick={closePopup}></Return>
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
