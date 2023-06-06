import { defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { FPopper } from '@fesjs/fes-design';
import { CloseOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import { EventHandlerModify } from '@webank/letgo-components';
import type { DocumentModel } from '@webank/letgo-designer';
import type { IPublicTypeEventHandler } from '@webank/letgo-types';
import { eventListTitle, iconCls, popperHeaderCls, popperWrapCls } from './event-header.css';

export default defineComponent({
    name: 'EventHandlerHeader',
    props: {
        title: String,
        documentModel: Object as PropType<DocumentModel>,
        eventHandler: Object as PropType<IPublicTypeEventHandler>,
        onChangeEventHandler: Function as PropType<(event: IPublicTypeEventHandler) => void>,
        addEventHandler: Function as PropType<(event: Event) => void>,
        onClose: Function as PropType<() => void>,
    },
    setup(props, { expose }) {
        const popperVisible = ref(false);
        const closePopper = () => {
            popperVisible.value = false;
        };

        const changeEventHandler = (event: IPublicTypeEventHandler) => {
            props.onChangeEventHandler(event);
            closePopper();
        };

        watch(popperVisible, () => {
            if (!popperVisible.value)
                props.onClose?.();
        });

        expose({
            showPopper() {
                popperVisible.value = true;
            },
        });

        return () => {
            return <div class={eventListTitle}>
                    <span>{props.title}</span>
                    <FPopper
                        v-model={popperVisible.value}
                        trigger="click"
                        placement="right-start"
                        v-slots={{
                            default: () => {
                                return <div class={popperWrapCls}>
                                        <div class={popperHeaderCls}>
                                            <CloseOutlined onClick={closePopper} class={iconCls} />
                                        </div>
                                        <EventHandlerModify
                                            onChange={changeEventHandler}
                                            documentModel={props.documentModel}
                                            editEvent={props.eventHandler}
                                        />
                                    </div>;
                            },
                            trigger: () => {
                                return <PlusOutlined class={iconCls} onClick={props.addEventHandler} />;
                            },
                        }}
                    />
                </div>;
        };
    },
});
