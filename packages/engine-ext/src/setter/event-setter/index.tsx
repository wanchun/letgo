import type { PropType, Ref } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import type { IEventHandler, IPublicTypeSetter } from '@webank/letgo-types';
import {
    FButton,
} from '@fesjs/fes-design';
import { genEventId } from '@webank/letgo-common';
import { IEnumEventHandlerAction, isRunFunctionEventHandler } from '@webank/letgo-types';
import { EventHandlerList, EventHandlerModify } from '@webank/letgo-components';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { commonProps } from '../../common';
import type { EventOptionList } from './interface';
import './index.less';

type EventList = Array<{ name: string, description?: string }>;

interface EventDefinition {
    type: 'events' | 'nativeEvents' | 'lifeCycleEvent'
    title: string
    list: EventList
}

function transformList(list: EventList): EventOptionList {
    return list.map((event) => {
        return {
            value: event.name,
            label: event.name,
            description: event.description,
        };
    });
}

const EventSetterView = defineComponent({
    name: 'EventSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<IEventHandler[]>,
        defaultValue: Object as PropType<IEventHandler[]>,
        onChange: Function as PropType<(componentEvents: IEventHandler[]) => void>,
        definition: Array as PropType<Array<EventDefinition>>,
    },
    setup(props) {
        const eventData: Ref<EventOptionList> = ref([]);

        const selectedEventData = ref<IEventHandler[]>(props.value || []);

        watch(
            () => props.definition,
            () => {
                let events: EventOptionList = [];
                props.definition.forEach((item) => {
                    events = events.concat(transformList(item.list || []));
                });
                selectedEventData.value = props.value || [];
                eventData.value = events;
            },
            {
                immediate: true,
            },
        );

        onMounted(() => {
            props.onMounted?.();
        });

        const getInitComponentEvent = (): IEventHandler => {
            return {
                id: genEventId(),
                name: eventData.value[0].value,
                waitType: 'debounce',
                waitMs: null,
                action: IEnumEventHandlerAction.CONTROL_QUERY,
                namespace: null,
                method: null,
            };
        };

        const currentEditEvent = ref<IEventHandler>(getInitComponentEvent());

        watch(() => props.value, () => {
            selectedEventData.value = props.value || [];
            if (currentEditEvent.value) {
                const matchEvent = selectedEventData.value.find(item => item.id === currentEditEvent.value.id);
                if (matchEvent)
                    currentEditEvent.value = matchEvent;

                else
                    currentEditEvent.value = getInitComponentEvent();
            }
        });

        const onEdit = (data: IEventHandler) => {
            currentEditEvent.value = { ...data };
            if (isRunFunctionEventHandler(data) && !currentEditEvent.value.params)
                currentEditEvent.value.params = [];
        };
        const emitChangeEventData = () => {
            props.onChange(selectedEventData.value);
        };
        const addEvent = () => {
            currentEditEvent.value = getInitComponentEvent();
            selectedEventData.value.push(currentEditEvent.value);
            emitChangeEventData();
        };

        const changeComponentEvent = (changedEvent: IEventHandler) => {
            const index = selectedEventData.value.findIndex(item => item.id === changedEvent.id);
            if (index === -1)
                selectedEventData.value.push(changedEvent);

            else
                selectedEventData.value.splice(index, 1, changedEvent);
            emitChangeEventData();
        };

        const deleteComponentEvent = (event: IEventHandler) => {
            const index = selectedEventData.value.findIndex(item => item.id === event.id);
            selectedEventData.value.splice(index, 1);
            if (currentEditEvent.value.id === event.id)
                currentEditEvent.value = getInitComponentEvent();
            emitChangeEventData();
        };

        return () => {
            return (
                <>
                    <div class="letgo-event-setter__header">
                        <div style="margin: 0; font-size: 14px;">已绑定事件</div>
                        <FButton type="link" onClick={addEvent} size="small">
                            新增
                            <PlusOutlined />
                        </FButton>
                    </div>
                    <EventHandlerList class="letgo-event-setter__list" style="margin-bottom: 8px; padding-bottom: 8px;" eventHandlers={selectedEventData.value} currentEventHandler={currentEditEvent.value} onDelete={deleteComponentEvent} onEdit={onEdit} />
                    <EventHandlerModify onChange={changeComponentEvent} documentModel={props.node.document} editEvent={currentEditEvent.value} events={eventData.value} />
                </>
            );
        };
    },
});

export const EventSetter: IPublicTypeSetter = {
    type: 'EventSetter',
    title: '事件设置器',
    Component: EventSetterView,
};
