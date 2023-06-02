import type { PropType, Ref } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import type { IPublicTypeComponentEvent, IPublicTypeSetter } from '@webank/letgo-types';
import {
    FButton,
} from '@fesjs/fes-design';
import { uniqueId } from '@webank/letgo-utils';
import { ComponentEventAction } from '@webank/letgo-types/es/component-event';
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

const EventSetterView = defineComponent({
    name: 'EventSetterView',
    props: {
        ...commonProps,
        value: Array as PropType<any>,
        defaultValue: Array as PropType<any>,
        onChange: Function as PropType<(eventList: any[]) => void>,
        definition: Array as PropType<Array<EventDefinition>>,
    },
    setup(props) {
        const eventData: Ref<EventOptionList> = ref([]);

        const selectedEventData = ref<IPublicTypeComponentEvent[]>([]);

        watch(
            () => props.definition,
            () => {
                let events: EventOptionList = [];
                props.definition.forEach((item) => {
                    events = events.concat(transformList(item.list || []));
                });
                selectedEventData.value = [];
                eventData.value = events;
            },
            {
                immediate: true,
            },
        );

        onMounted(() => {
            props.onMounted?.();
        });

        const getInitComponentEvent = (): IPublicTypeComponentEvent => {
            return {
                id: genEventId(),
                name: eventData.value[0].value,
                debounce: null,
                action: ComponentEventAction.CONTROL_QUERY,
                callId: null,
                method: null,
            };
        };

        const currentEditEvent = ref<IPublicTypeComponentEvent>(getInitComponentEvent());
        const onEdit = (data: IPublicTypeComponentEvent) => {
            currentEditEvent.value = { ...data };
        };
        const addEvent = () => {
            currentEditEvent.value = getInitComponentEvent();
            selectedEventData.value.push(currentEditEvent.value);
        };

        const onChange = (changedEvent: IPublicTypeComponentEvent) => {
            const index = selectedEventData.value.findIndex(item => item.id === changedEvent.id);
            if (index === -1)
                selectedEventData.value.push(changedEvent);

            else
                selectedEventData.value.splice(index, 1, changedEvent);
        };

        const deleteComponentEvent = (event: IPublicTypeComponentEvent) => {
            const index = selectedEventData.value.findIndex(item => item.id === event.id);
            selectedEventData.value.splice(index, 1);
            if (currentEditEvent.value.id === event.id)
                currentEditEvent.value = getInitComponentEvent();
        };

        const getMethodCall = (item: IPublicTypeComponentEvent) => {
            if (item.callId && item.method)
                return `${item.callId}.${item.method}()`;

            return '';
        };

        return () => {
            return (
                <>
                    <div class={headerCls}>
                        <h3 style="margin: 0">已绑定事件</h3>
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
                    <ModifyBlock onChange={onChange} documentModel={props.node.document} editEvent={currentEditEvent.value} events={eventData.value} />
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
