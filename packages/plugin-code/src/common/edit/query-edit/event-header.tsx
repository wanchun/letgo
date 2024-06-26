import { defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { FPopper } from '@fesjs/fes-design';
import { CloseOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import { EventHandlerModify } from '@webank/letgo-components';
import type { IEventHandler, IPublicModelProject } from '@webank/letgo-types';
import './event-header.less';

export default defineComponent({
    name: 'EventHandlerHeader',
    props: {
        title: String,
        isGlobal: Boolean,
        project: Object as PropType<IPublicModelProject>,
        eventHandler: Object as PropType<IEventHandler>,
        onChangeEventHandler: Function as PropType<(event: IEventHandler) => void>,
        addEventHandler: Function as PropType<(event: Event) => void>,
        onClose: Function as PropType<() => void>,
    },
    setup(props, { expose }) {
        const popperVisible = ref(false);
        const closePopper = () => {
            popperVisible.value = false;
        };

        watch(popperVisible, () => {
            if (!popperVisible.value)
                props.onClose();
        });

        expose({
            showPopper() {
                popperVisible.value = true;
            },
        });

        return () => {
            return (
                <div class="letgo-plg-code__event-title">
                    <span>{props.title}</span>
                    <FPopper
                        v-model={popperVisible.value}
                        trigger="click"
                        placement="right-start"
                        v-slots={{
                            default: () => {
                                return (
                                    <div class="letgo-plg-code__event-popper">
                                        <div class="letgo-plg-code__event-popper-header">
                                            <CloseOutlined onClick={closePopper} class="letgo-plg-code__event-icon" />
                                        </div>
                                        <EventHandlerModify
                                            onChange={props.onChangeEventHandler}
                                            project={props.project}
                                            isGlobal={props.isGlobal}
                                            editEvent={props.eventHandler}
                                        />
                                    </div>
                                );
                            },
                            trigger: () => {
                                return <PlusOutlined class="letgo-plg-code__event-icon" onClick={props.addEventHandler} />;
                            },
                        }}
                    />
                </div>
            );
        };
    },
});
