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
import type { EventOptionList } from './interface';

// const DEFINITION_EVENT_TYPE = {
//     EVENTS: 'events',
//     NATIVE_EVENTS: 'nativeEvents',
//     LIFE_CYCLE_EVENT: 'lifeCycleEvent',
// };

type EventList = Array<{ name: string; description?: string }>;

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
        value: Array as PropType<any>,
        defaultValue: Array as PropType<any>,
        onChange: Function as PropType<(eventList: any[]) => void>,
        definition: Array as PropType<Array<EventDefinition>>,
    },
    setup(props) {
        const eventData: Ref<EventOptionList> = ref([]);

        const selectedEventData = ref([]);

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
                                                    return <ModifyBlock events={eventData.value}></ModifyBlock>;
                                                },
                                            }}
                                        >
                                                 事件<PlusCircleOutlined class={plusIconCls} />

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
                         <FTableColumn
                            label="操作"
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

export const EventSetter: IPublicTypeSetter = {
    type: 'EventSetter',
    title: '事件设置器',
    Component: EventSetterView,
};
