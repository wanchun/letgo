import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FOption, FSelect } from '@fesjs/fes-design';
import type { IEventHandler, IPublicModelProject } from '@webank/letgo-types';
import { IEnumEventHandlerAction } from '@webank/letgo-types';
import { cloneDeep, isEqual } from 'lodash-es';
import Label from './label';
import Separator from './separator';
import RenderOptions from './render-options';
import './modify-block.less';

const actions = [{
    value: IEnumEventHandlerAction.CONTROL_QUERY,
    label: '控制查询',
}, {
    value: IEnumEventHandlerAction.SET_TEMPORARY_STATE,
    label: '设置变量值',
}, {
    value: IEnumEventHandlerAction.RUN_FUNCTION,
    label: '执行函数',
}, {
    value: IEnumEventHandlerAction.CONTROL_COMPONENT,
    label: '控制组件',
}, {
    value: IEnumEventHandlerAction.SET_LOCAL_STORAGE,
    label: '设置本地存储',
}];

const initOptions: any = {
    [IEnumEventHandlerAction.CONTROL_QUERY]: {
        namespace: null,
        method: 'trigger',
    },
    [IEnumEventHandlerAction.CONTROL_COMPONENT]: {
        namespace: null,
        method: null,
    },
    [IEnumEventHandlerAction.SET_TEMPORARY_STATE]: {
        namespace: null,
        method: 'setValue',
        params: [],
    },
    [IEnumEventHandlerAction.SET_LOCAL_STORAGE]: {
        namespace: 'localStorage',
        method: 'setValue',
        params: [],
    },
    [IEnumEventHandlerAction.RUN_FUNCTION]: {
        namespace: null,
        method: null,
        funcBody: '',
        params: [],
    },
};

interface Option { label: string; value: string }

export default defineComponent({
    name: 'EventHandlerModify',
    props: {
        project: Object as PropType<IPublicModelProject>,
        isGlobal: Boolean,
        editEvent: Object as PropType<IEventHandler>,
        events: {
            type: Array as PropType<Option[]>,
            default: () => [] as Option[],
        },
        onChange: Function as PropType<(data: IEventHandler) => void>,
    },
    setup(props) {
        const innerEditEvent = ref(cloneDeep(props.editEvent));
        watch(() => props.editEvent, () => {
            if (!isEqual(innerEditEvent.value, props.editEvent))
                innerEditEvent.value = cloneDeep(props.editEvent);
        });
        watch(innerEditEvent, () => {
            props.onChange(innerEditEvent.value);
        }, {
            deep: true,
        });
        const renderEvent = () => {
            return props.events.length
                ? (
                    <Label label="事件">
                        <FSelect v-model={innerEditEvent.value.name} options={props.events} />
                    </Label>
                    )
                : null;
        };

        const resetAction = (action: string) => {
            innerEditEvent.value = {
                ...innerEditEvent.value,
                ...initOptions[action],
            };
        };
        const actionOptions = computed(() => {
            if (props.isGlobal)
                return actions.filter(item => item.value !== IEnumEventHandlerAction.CONTROL_COMPONENT);

            return actions;
        });
        const renderAction = () => {
            return (
                <Label label="动作">
                    <FSelect appendToContainer={false} v-model={innerEditEvent.value.action} onChange={resetAction}>
                        {actionOptions.value.map(action => <FOption value={action.value}>{action.label}</FOption>)}
                    </FSelect>
                </Label>
            );
        };
        const firstSeparatorText = computed(() => {
            const item = actions.find(item => item.value === innerEditEvent.value.action);
            return item ? `${item.label}选项` : '选项';
        });

        return () => {
            return (
                innerEditEvent.value && (
                    <div class="letgo-comp-event__modify">
                        {renderEvent()}
                        {renderAction()}
                        <Separator text={firstSeparatorText.value} />
                        <RenderOptions project={props.project} isGlobal={props.isGlobal} componentEvent={innerEditEvent.value} />
                    </div>
                )
            );
        };
    },
});
