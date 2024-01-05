import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { genEventId } from '@webank/letgo-common';
import { EventHandlerList } from '@webank/letgo-components';
import type { IEventHandler, IPublicModelDocumentModel, IQueryResourceBase } from '@webank/letgo-types';
import { IEnumEventHandlerAction } from '@webank/letgo-types';
import './event-handlers.less';
import EventHeader from './event-header';

type EventType = 'successEvent' | 'failureEvent';

export default defineComponent({
    name: 'EventHandler',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        codeItem: Object as PropType<IQueryResourceBase>,
        changeCodeItem: Function as PropType<(content: Partial<IQueryResourceBase>) => void>,
    },
    setup(props) {
        const currentEditEvent = ref<IEventHandler>();

        const onDelete = (eventType: EventType, event: IEventHandler) => {
            const eventList = [...props.codeItem[eventType]];
            const index = eventList.findIndex(item => item.id === event.id);
            if (index !== -1) {
                eventList.splice(index, 1);
                props.changeCodeItem({
                    [eventType]: eventList,
                });
            }
        };
        const changeEventHandler = (eventType: EventType, event: IEventHandler) => {
            const eventList = [...(props.codeItem[eventType] || [])];
            const index = eventList.findIndex(item => item.id === event.id);
            if (index === -1)
                eventList.push(event);
            else
                eventList.splice(index, 1, event);

            props.changeCodeItem({
                [eventType]: eventList,
            });
        };

        const addEventHandler = (name: string) => {
            currentEditEvent.value = {
                id: genEventId(),
                name,
                waitType: 'debounce',
                waitMs: null,
                action: IEnumEventHandlerAction.CONTROL_QUERY,
                namespace: null,
                method: null,
            };
        };

        const successPopperRef = ref();
        const addSuccessEventHandler = () => {
            addEventHandler('onSuccess');
        };
        const onDeleteSuccessEvent = (event: IEventHandler) => {
            onDelete('successEvent', event);
        };
        const onEditSuccessEvent = (event: IEventHandler) => {
            currentEditEvent.value = event;
            successPopperRef.value.showPopper();
        };
        const changeSuccessEventHandler = (event: IEventHandler) => {
            changeEventHandler('successEvent', event);
        };

        const failurePopperRef = ref();
        const addFailureEventHandler = () => {
            addEventHandler('onFailure');
        };
        const onDeleteFailureEvent = (event: IEventHandler) => {
            onDelete('failureEvent', event);
        };
        const onEditFailureEvent = (event: IEventHandler) => {
            currentEditEvent.value = event;
            failurePopperRef.value.showPopper();
        };
        const changeFailureEventHandler = (event: IEventHandler) => {
            changeEventHandler('failureEvent', event);
        };

        const onClose = () => {
            currentEditEvent.value = null;
        };

        return () => {
            return (
                <div class="letgo-plg-code__event-handlers">
                    <div class="letgo-plg-code__event-handlers-title">事件绑定</div>
                    <div>
                        <EventHeader
                            ref={successPopperRef}
                            title="成功"
                            onClose={onClose}
                            documentModel={props.documentModel}
                            eventHandler={currentEditEvent.value}
                            onChangeEventHandler={changeSuccessEventHandler}
                            addEventHandler={addSuccessEventHandler}
                        />
                        <div class="letgo-plg-code__event-content">
                            <EventHandlerList
                                visibleName={false}
                                class="letgo-plg-code__event-list"
                                eventHandlers={props.codeItem.successEvent}
                                currentEventHandler={currentEditEvent.value}
                                onDelete={onDeleteSuccessEvent}
                                onEdit={onEditSuccessEvent}
                            />
                        </div>
                    </div>
                    <div class="letgo-plg-code__event-failure">
                        <EventHeader
                            ref={failurePopperRef}
                            title="失败"
                            onClose={onClose}
                            documentModel={props.documentModel}
                            eventHandler={currentEditEvent.value}
                            onChangeEventHandler={changeFailureEventHandler}
                            addEventHandler={addFailureEventHandler}
                        />
                        <div class="letgo-plg-code__event-content">
                            <EventHandlerList
                                visibleName={false}
                                class="letgo-plg-code__event-list"
                                eventHandlers={props.codeItem.failureEvent}
                                currentEventHandler={currentEditEvent.value}
                                onDelete={onDeleteFailureEvent}
                                onEdit={onEditFailureEvent}
                            />
                        </div>
                    </div>
                </div>
            );
        };
    },
});
