import type { PropType, Ref } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import {
    FSpace,
    FTable,
    FTableColumn,
    FTooltip,
} from '@fesjs/fes-design';
import { PlusCircleOutlined } from '@fesjs/fes-design/icon';
import { Delete, Setting } from '@icon-park/vue-next';
import { commonProps } from '../../common';
import { plusIconCls, pointerCls } from './index.css';
import ModifyBlock from './modify/modify-block';

const DEFINITION_EVENT_TYPE = {
    EVENTS: 'events',
    NATIVE_EVENTS: 'nativeEvents',
    LIFE_CYCLE_EVENT: 'lifeCycleEvent',
};

type EventList = Array<{ name: string; description?: string }>;

interface EventDefinition {
    type: 'events' | 'nativeEvents' | 'lifeCycleEvent'
    title: string
    list: EventList
}

type OptionList = Array<{
    value: string
    label: string
    description?: string
}>;

interface EventType {
    value: string
    label: string
    list: OptionList
    choose: string[]
}

function transformList(list: EventList): OptionList {
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
        const eventData: Ref<EventType[]> = ref([]);

        const selectedEventData = ref([]);

        watch(
            eventData,
            () => {
                let arr: Array<{ name: string }> = [];
                eventData.value.forEach((item) => {
                    arr = arr.concat(
                        item.choose.map((name) => {
                            return {
                                name,
                                target: item,
                            };
                        }),
                    );
                });
                selectedEventData.value = arr;
            },
            {
                deep: true,
            },
        );

        watch(
            () => props.definition,
            () => {
                const events: EventType[] = [];
                props.definition.forEach((item) => {
                    if (item.type === DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT) {
                        const eventItem: EventType = {
                            value: item.type,
                            label: '生命周期',
                            list: transformList(item.list || []),
                            choose: [],
                        };
                        events.push(eventItem);
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.EVENTS) {
                        const eventItem: EventType = {
                            value: item.type,
                            label: '组件自带事件',
                            list: transformList(item.list || []),
                            choose: [],
                        };
                        events.push(eventItem);
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.NATIVE_EVENTS) {
                        const eventItem: EventType = {
                            value: item.type,
                            label: '原生事件',
                            list: transformList(item.list || []),
                            choose: [],
                        };
                        events.push(eventItem);
                    }
                });
                eventData.value = events;
            },
            {
                immediate: true,
            },
        );

        const handleDelete = (row: any) => {
            const { name, target } = row;
            const index = target.choose.indexOf(name);
            if (index !== -1)
                target.choose.splice(index, 1);
        };

        onMounted(() => {
            props.onMounted?.();
        });

        const addEvent = () => {

        };

        return () => {
            return (
                <>
                    <FTable data={selectedEventData.value} bordered>
                        <FTableColumn
                            prop="name"
                            label="事件"
                        ></FTableColumn>
                        <FTableColumn
                            label=""
                            width={80}
                            v-slots={{
                                header: () => {
                                    return <span>
                                        <FTooltip
                                            trigger="click"
                                            mode="popover"
                                            placement="left-start"
                                            v-slots={{
                                                content: () => {
                                                    return <ModifyBlock></ModifyBlock>;
                                                },
                                            }}
                                        >
                                                 <PlusCircleOutlined class={plusIconCls} />

                                        </FTooltip>
                                    </span>;
                                },
                                default: ({ row }: { row: any }) => {
                                    return (
                                        <FSpace justify="space-between">
                                            <Setting
                                                class={pointerCls}
                                            ></Setting>
                                            <Delete
                                                onClick={() => {
                                                    handleDelete(row);
                                                }}
                                                class={pointerCls}
                                            ></Delete>
                                        </FSpace>
                                    );
                                },
                            }}
                        ></FTableColumn>
                    </FTable>
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
