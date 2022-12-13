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

type Events = Array<{
    value: string;
    label: string;
    list: EventList;
}>;

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
        console.log(props);
        const eventData: Ref<Events> = ref([]);

        watch(
            () => props.definition,
            () => {
                const events: Events = [];
                props.definition.forEach((item) => {
                    if (item.type === DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT) {
                        const eventItem = {
                            value: item.type,
                            label: '生命周期',
                            list: item.list || [],
                        };
                        events.push(eventItem);
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.EVENTS) {
                        const eventItem = {
                            value: item.type,
                            label: '组件自带事件',
                            list: item.list || [],
                        };
                        events.push(eventItem);
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.NATIVE_EVENTS) {
                        const eventItem = {
                            value: item.type,
                            label: '原生事件',
                            list: item.list || [],
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
                                        options={item.list.map((event) => {
                                            return {
                                                value: event.name,
                                                label: event.name,
                                                description: event.description,
                                            };
                                        })}
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
                                                        <span>
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
                    <FTable bordered>
                        <FTableColumn
                            prop="name"
                            label="已有事件"
                        ></FTableColumn>
                        <FTableColumn
                            label="操作"
                            v-slots={{
                                default: () => {
                                    return (
                                        <>
                                            <Setting></Setting>
                                            <Delete></Delete>
                                        </>
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
    title: '事件设置器',
    Component: EventSetterView,
};
