import type { PropType, Ref } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import type { IPublicTypeEventHandler, IPublicTypeSetter } from '@webank/letgo-types';
import {
    FButton,
} from '@fesjs/fes-design';
import { uniqueId } from '@webank/letgo-utils';
import { EventHandlerAction } from '@webank/letgo-types';
import { DeleteOutlined, PlusOutlined } from '@fesjs/fes-design/icon';
import { commonProps } from '../../common';
import ModifyBlock from './modify/modify-block';
import type { EventOptionList } from './interface';
import { activeEventCls, callExpressionCls, deleteIconCls, headerCls, selectedEventCls, selectedEventListCls } from './index.css';

type EventList = Array<{ name: string; description?: string }>;

interface EventDefinition {
    type: 'events' | 'nativeEvents' | 'lifeCycleEvent'
    title: string
    list: EventList
}

function genEventId() {
    return uniqueId('event_');
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

interface EventData { eventList: EventOptionList; componentEvents: IPublicTypeEventHandler[] }

const EventSetterView = defineComponent({
    name: 'EventSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<EventData>,
        defaultValue: Object as PropType<EventData>,
        onChange: Function as PropType<({ eventList, componentEvents }: EventData) => void>,
        definition: Array as PropType<Array<EventDefinition>>,
    },
    setup(props) {
        const eventData: Ref<EventOptionList> = ref([]);

        const selectedEventData = ref<IPublicTypeEventHandler[]>(props.value?.componentEvents || []);

        watch(
            () => props.definition,
            () => {
                let events: EventOptionList = [];
                props.definition.forEach((item) => {
                    events = events.concat(transformList(item.list || []));
                });
                selectedEventData.value = props.value?.componentEvents || [];
                eventData.value = events;
            },
            {
                immediate: true,
            },
        );

        watch(() => props.value, () => {
            selectedEventData.value = props.value?.componentEvents || [];
        });

        onMounted(() => {
            props.onMounted?.();
        });

        const getInitComponentEvent = (): IPublicTypeEventHandler => {
            return {
                id: genEventId(),
                name: eventData.value[0].value,
                waitType: 'debounce',
                waitMs: null,
                action: EventHandlerAction.CONTROL_QUERY,
                callId: null,
                method: null,
            };
        };

        const currentEditEvent = ref<IPublicTypeEventHandler>(getInitComponentEvent());
        const onEdit = (data: IPublicTypeEventHandler) => {
            currentEditEvent.value = { ...data };
        };
        const emitChangeEventData = () => {
            props.onChange({
                eventList: eventData.value,
                componentEvents: selectedEventData.value,
            });
        };
        const addEvent = () => {
            currentEditEvent.value = getInitComponentEvent();
            selectedEventData.value.push(currentEditEvent.value);
            emitChangeEventData();
        };

        const changeComponentEvent = (changedEvent: IPublicTypeEventHandler) => {
            const index = selectedEventData.value.findIndex(item => item.id === changedEvent.id);
            if (index === -1)
                selectedEventData.value.push(changedEvent);

            else
                selectedEventData.value.splice(index, 1, changedEvent);
            emitChangeEventData();
        };

        const deleteComponentEvent = (event: IPublicTypeEventHandler) => {
            const index = selectedEventData.value.findIndex(item => item.id === event.id);
            selectedEventData.value.splice(index, 1);
            if (currentEditEvent.value.id === event.id)
                currentEditEvent.value = getInitComponentEvent();
            emitChangeEventData();
        };

        const getMethodCall = (item: IPublicTypeEventHandler) => {
            if (item.callId && item.method)
                return `${item.callId}.${item.method}()`;

            return '';
        };

        return () => {
            return (
                <>
                    <div class={headerCls}>
                        <h3 style="margin: 0; font-size: 14px;">已绑定事件</h3>
                        <FButton type="link" onClick={addEvent} size="small">新增<PlusOutlined /></FButton>
                    </div>
                    <ul class={selectedEventListCls}>
                        {selectedEventData.value.map(item => (
                            <li class={[selectedEventCls, item.id === currentEditEvent.value.id && activeEventCls]} onClick={() => onEdit(item)} key={item.id}>
                                {item.name}
                                <span class={callExpressionCls}>
                                    {getMethodCall(item)}
                                </span>

                                <DeleteOutlined class={deleteIconCls} onClick={() => deleteComponentEvent(item)} />
                            </li>
                        ))}
                    </ul>
                    <ModifyBlock onChange={changeComponentEvent} documentModel={props.node.document} editEvent={currentEditEvent.value} events={eventData.value} />
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
