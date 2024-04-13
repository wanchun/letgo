import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { genEventId } from '@webank/letgo-common';
import { EventHandlerList } from '@webank/letgo-components';
import type { IEventHandler, IPublicModelDocumentModel, IQueryResourceBase } from '@webank/letgo-types';
import { IEnumEventHandlerAction } from '@webank/letgo-types';
import './event-handlers.less';
import EventHeader from './event-header';

type EventType = 'successEvent' | 'failureEvent';

const EventNameToField = {
    onSuccess: 'successEvent',
    onFailure: 'failureEvent',
};

export default defineComponent({
    name: 'EventHandler',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        codeItem: Object as PropType<IQueryResourceBase>,
        changeCodeItem: Function as PropType<(content: Partial<IQueryResourceBase>) => void>,
    },
    setup(props) {
        const currentEditEvent = ref<IEventHandler>();

        const onDelete = (event: IEventHandler) => {
            const eventType = EventNameToField[event.name as keyof typeof EventNameToField] as EventType;
            const eventList = [...(props.codeItem[eventType] || [])];
            const index = eventList.findIndex(item => item.id === event.id);
            if (index !== -1) {
                eventList.splice(index, 1);
                props.changeCodeItem({
                    [eventType]: eventList,
                });
            }
        };
        const changeEventHandler = (event: IEventHandler) => {
            const eventType = EventNameToField[event.name as keyof typeof EventNameToField] as EventType;

            currentEditEvent.value = event;

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
        const onEditSuccessEvent = (event: IEventHandler) => {
            currentEditEvent.value = event;
            successPopperRef.value.showPopper();
        };

        const failurePopperRef = ref();
        const addFailureEventHandler = () => {
            addEventHandler('onFailure');
        };
        const onEditFailureEvent = (event: IEventHandler) => {
            currentEditEvent.value = event;
            failurePopperRef.value.showPopper();
        };

        const onClose = () => {
            if (currentEditEvent.value && !currentEditEvent.value.namespace)
                onDelete(currentEditEvent.value);
        };

        return () => {
            return (
                <div class="letgo-plg-code__event-handlers">
                    <div class="letgo-plg-code__event-handlers-title">事件绑定</div>
                    <div>
                        <EventHeader
                            ref={successPopperRef}
                            title="成功"
                            documentModel={props.documentModel}
                            eventHandler={currentEditEvent.value}
                            onChangeEventHandler={changeEventHandler}
                            addEventHandler={addSuccessEventHandler}
                            onClose={onClose}
                        />
                        <div class="letgo-plg-code__event-content">
                            <EventHandlerList
                                visibleName={false}
                                class="letgo-plg-code__event-list"
                                eventHandlers={props.codeItem.successEvent}
                                currentEventHandler={currentEditEvent.value}
                                onDelete={onDelete}
                                onEdit={onEditSuccessEvent}
                            />
                        </div>
                    </div>
                    <div class="letgo-plg-code__event-failure">
                        <EventHeader
                            ref={failurePopperRef}
                            title="失败"
                            documentModel={props.documentModel}
                            eventHandler={currentEditEvent.value}
                            onChangeEventHandler={changeEventHandler}
                            addEventHandler={addFailureEventHandler}
                            onClose={onClose}
                        />
                        <div class="letgo-plg-code__event-content">
                            <EventHandlerList
                                visibleName={false}
                                class="letgo-plg-code__event-list"
                                eventHandlers={props.codeItem.failureEvent}
                                currentEventHandler={currentEditEvent.value}
                                onDelete={onDelete}
                                onEdit={onEditFailureEvent}
                            />
                        </div>
                    </div>
                </div>
            );
        };
    },
});
