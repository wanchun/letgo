import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FInputNumber, FOption, FSelect } from '@fesjs/fes-design';
import type { IEventHandler, IPublicModelDocumentModel } from '@webank/letgo-types';
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
    value: IEnumEventHandlerAction.CONTROL_COMPONENT,
    label: '控制组件',
}, {
    value: IEnumEventHandlerAction.SET_TEMPORARY_STATE,
    label: '设置变量值',
}, {
    value: IEnumEventHandlerAction.SET_LOCAL_STORAGE,
    label: '设置本地存储',
}, {
    value: IEnumEventHandlerAction.RUN_FUNCTION,
    label: '执行函数',
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
        documentModel: Object as PropType<IPublicModelDocumentModel>,
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

        const currentAction = ref();
        const changeAction = (action: string) => {
            innerEditEvent.value = {
                ...innerEditEvent.value,
                ...initOptions[action],
            };
        };
        const renderAction = () => {
            return (
                <Label label="动作">
                    <FSelect appendToContainer={false} v-model={innerEditEvent.value.action} onChange={changeAction}>
                        {actions.map(action => <FOption value={action.value}>{action.label}</FOption>)}
                    </FSelect>
                </Label>
            );
        };
        const firstSeparatorText = computed(() => {
            const item = actions.find(item => item.value === currentAction.value);
            return item ? `${item.label}选项` : '选项';
        });

        return () => {
            return (
                innerEditEvent.value && (
                    <div class="letgo-comp-event__modify">
                        {renderEvent()}
                        {renderAction()}
                        <Separator text={firstSeparatorText.value} />
                        <RenderOptions documentModel={props.documentModel} componentEvent={innerEditEvent.value} />
                        <Separator text="高级" />
                        <Label label="延迟">
                            <FInputNumber v-model={innerEditEvent.value.waitMs} />
                        </Label>
                    </div>
                )
            );
        };
    },
});
