import { defineComponent, PropType, onMounted, ref, Ref, watch } from 'vue';
import { Setter } from '@webank/letgo-types';
import { commonProps } from '../../common/setter-props';

const EVENT_CONTENTS = {
    COMPONENT_EVENT: 'componentEvent',
    NATIVE_EVENT: 'nativeEvent',
    LIFE_CYCLE_EVENT: 'lifeCycleEvent',
};

const DEFINITION_EVENT_TYPE = {
    EVENTS: 'events',
    NATIVE_EVENTS: 'nativeEvents',
    LIFE_CYCLE_EVENT: 'lifeCycleEvent',
};

type EventDefinition = {
    type: 'events' | 'nativeEvents' | 'lifeCycleEvent';
    title: string;
    list: Array<{ name: string }>;
};

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
        const eventButtons = ref([]);
        const isRoot = ref(false);
        const isCustom = ref(false);

        watch(
            () => props.definition,
            () => {
                props.definition.map((item) => {
                    if (item.type === DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT) {
                        isRoot.value = true;
                    }

                    if (item.type === DEFINITION_EVENT_TYPE.EVENTS) {
                        isCustom.value = true;
                    }
                    return item;
                });

                if (isRoot.value) {
                    eventButtons.value = [
                        {
                            value: EVENT_CONTENTS.LIFE_CYCLE_EVENT,
                            label: '生命周期',
                        },
                    ];
                } else if (isCustom.value) {
                    eventButtons.value = [
                        {
                            value: EVENT_CONTENTS.COMPONENT_EVENT,
                            label: '组件自带事件',
                        },
                    ];
                } else {
                    eventButtons.value = [
                        {
                            value: EVENT_CONTENTS.NATIVE_EVENT,
                            label: '原生事件',
                        },
                    ];
                }
            },
            {
                immediate: true,
            },
        );

        onMounted(() => {
            props.onMounted?.();
        });

        return () => {
            return null;
        };
    },
});

export const EventSetter: Setter = {
    type: 'EventSetter',
    title: '事件设置器',
    Component: EventSetterView,
};
