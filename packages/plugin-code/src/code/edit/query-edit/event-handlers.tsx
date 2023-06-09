import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { genEventId } from '@webank/letgo-common';
import { EventHandlerList } from '@webank/letgo-components';
import type { DocumentModel } from '@webank/letgo-designer';
import type { IJavascriptQuery, IPublicTypeEventHandler } from '@webank/letgo-types';
import { InnerEventHandlerAction } from '@webank/letgo-types';
import { contentCls, eventHandlersCls, eventListCls, failureCls, titleCls } from './event-handlers.css';
import EventHeader from './event-header';

type EventType = 'successEvent' | 'failureEvent';

export default defineComponent({
    name: 'EventHandler',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const currentEditEvent = ref<IPublicTypeEventHandler>();

        const onDelete = (eventType: EventType, event: IPublicTypeEventHandler) => {
            const eventList = [...props.codeItem[eventType]];
            const index = eventList.findIndex(item => item.id === event.id);
            if (index !== -1) {
                eventList.splice(index, 1);
                props.changeCodeItem({
                    [eventType]: eventList,
                });
            }
        };
        const changeEventHandler = (eventType: EventType, event: IPublicTypeEventHandler) => {
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
                action: InnerEventHandlerAction.CONTROL_QUERY,
                namespace: null,
                method: null,
            };
        };

        const successPopperRef = ref();
        const addSuccessEventHandler = () => {
            addEventHandler('onSuccess');
        };
        const onDeleteSuccessEvent = (event: IPublicTypeEventHandler) => {
            onDelete('successEvent', event);
        };
        const onEditSuccessEvent = (event: IPublicTypeEventHandler) => {
            currentEditEvent.value = event;
            successPopperRef.value.showPopper();
        };
        const changeSuccessEventHandler = (event: IPublicTypeEventHandler) => {
            changeEventHandler('successEvent', event);
        };

        const failurePopperRef = ref();
        const addFailureEventHandler = () => {
            addEventHandler('onFailure');
        };
        const onDeleteFailureEvent = (event: IPublicTypeEventHandler) => {
            onDelete('failureEvent', event);
        };
        const onEditFailureEvent = (event: IPublicTypeEventHandler) => {
            currentEditEvent.value = event;
            failurePopperRef.value.showPopper();
        };
        const changeFailureEventHandler = (event: IPublicTypeEventHandler) => {
            changeEventHandler('failureEvent', event);
        };

        const onClose = () => {
            currentEditEvent.value = null;
        };

        return () => {
            return <div class={eventHandlersCls}>
                <h5 class={titleCls}>事件绑定</h5>
                <div>
                    <EventHeader
                        ref={successPopperRef}
                        title="Success"
                        onClose={onClose}
                        documentModel={props.documentModel}
                        eventHandler={currentEditEvent.value}
                        onChangeEventHandler={changeSuccessEventHandler}
                        addEventHandler={addSuccessEventHandler}
                    />
                    <div class={contentCls}>
                        <EventHandlerList
                            visibleName={false}
                            class={eventListCls}
                            eventHandlers={props.codeItem.successEvent}
                            currentEventHandler={currentEditEvent.value}
                            onDelete={onDeleteSuccessEvent}
                            onEdit={onEditSuccessEvent}
                        />
                    </div>
                </div>
                <div class={failureCls}>
                    <EventHeader
                        ref={failurePopperRef}
                        title="Failure"
                        onClose={onClose}
                        documentModel={props.documentModel}
                        eventHandler={currentEditEvent.value}
                        onChangeEventHandler={changeFailureEventHandler}
                        addEventHandler={addFailureEventHandler}
                    />
                    <div class={contentCls}>
                        <EventHandlerList
                            visibleName={false}
                            class={eventListCls}
                            eventHandlers={props.codeItem.failureEvent}
                            currentEventHandler={currentEditEvent.value}
                            onDelete={onDeleteFailureEvent}
                            onEdit={onEditFailureEvent}
                        />
                    </div>
                </div>
            </div>;
        };
    },
});
