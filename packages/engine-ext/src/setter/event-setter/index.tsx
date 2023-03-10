import { defineComponent, PropType, onMounted, ref, Ref, watch } from 'vue';
import { Setter } from '@webank/letgo-types';
import {
    FSelect,
    FForm,
    FFormItem,
    FSpace,
    FTable,
    FTableColumn,
} from '@fesjs/fes-design';
import { Setting, Delete } from '@icon-park/vue-next';
import { commonProps } from '../../common/setter-props';
import { pointerCls, lightCls } from './index.css';

const DEFINITION_EVENT_TYPE = {
    EVENTS: 'events',
    NATIVE_EVENTS: 'nativeEvents',
    LIFE_CYCLE_EVENT: 'lifeCycleEvent',
};

type EventList = Array<{ name: string; description?: string }>;

type EventDefinition = {
    type: 'events' | 'nativeEvents' | 'lifeCycleEvent';
    title: string;
    list: EventList;
};

type OptionList = Array<{
    value: string;
    label: string;
    description?: string;
}>;

type EventType = {
    value: string;
    label: string;
    list: OptionList;
    choose: string[];
};

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
                            label: '????????????',
                            list: transformList(item.list || []),
                            choose: [],
                        };
                        events.push(eventItem);
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.EVENTS) {
                        const eventItem: EventType = {
                            value: item.type,
                            label: '??????????????????',
                            list: transformList(item.list || []),
                            choose: [],
                        };
                        events.push(eventItem);
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.NATIVE_EVENTS) {
                        const eventItem: EventType = {
                            value: item.type,
                            label: '????????????',
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
            if (index !== -1) {
                target.choose.splice(index, 1);
            }
        };

        onMounted(() => {
            props.onMounted?.();
        });

        return () => {
            return (
                <>
                    <FForm labelPosition={'top'}>
                        {eventData.value.map((item) => {
                            return (
                                <FFormItem label={item.label}>
                                    <FSelect
                                        multiple
                                        v-model={item.choose}
                                        options={item.list}
                                        v-slots={{
                                            option: ({
                                                value,
                                                description,
                                            }: {
                                                value: string;
                                                description: string;
                                            }) => {
                                                return (
                                                    <FSpace justify="space-between">
                                                        <span>{value}</span>
                                                        <span class={lightCls}>
                                                            {description}
                                                        </span>
                                                    </FSpace>
                                                );
                                            },
                                        }}
                                    ></FSelect>
                                </FFormItem>
                            );
                        })}
                    </FForm>
                    <FTable data={selectedEventData.value} bordered>
                        <FTableColumn
                            prop="name"
                            label="????????????"
                        ></FTableColumn>
                        <FTableColumn
                            label="??????"
                            width={80}
                            v-slots={{
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

export const EventSetter: Setter = {
    type: 'EventSetter',
    title: '???????????????',
    Component: EventSetterView,
};
