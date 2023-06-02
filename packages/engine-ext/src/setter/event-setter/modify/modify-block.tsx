import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton, FInput, FInputNumber, FOption, FSelect, FSpace } from '@fesjs/fes-design';
import type { IPublicTypeComponentEvent } from '@webank/letgo-types/es/component-event';
import { ComponentEventAction } from '@webank/letgo-types/es/component-event';
import type { DocumentModel } from '@webank/letgo-designer';
import type { EventOptionList } from '../interface';
import Label from './label';
import Separator from './separator';
import RenderOptions from './render-options';
import { blockCls } from './modify-block.css';

const actions = [{
    value: ComponentEventAction.CONTROL_QUERY,
    label: '控制查询',
}, {
    value: ComponentEventAction.CONTROL_COMPONENT,
    label: '控制组件',
}, {
    value: ComponentEventAction.GO_TO_URL,
    label: '应用跳转',
}, {
    value: ComponentEventAction.GO_TO_PAGE,
    label: '页面跳转',
}, {
    value: ComponentEventAction.SET_TEMPORARY_STATE,
    label: '设置临时状态',
}, {
    value: ComponentEventAction.SET_LOCAL_STORAGE,
    label: '设置本地存储',
}];

const initOptions: any = {
    [ComponentEventAction.CONTROL_QUERY]: {
        callId: null,
        method: 'trigger',
    },
    [ComponentEventAction.CONTROL_COMPONENT]: {
        method: null,
    },
    [ComponentEventAction.GO_TO_URL]: {
        callId: 'utils',
        method: 'openUrl',
        url: '',
        isOpenNewTab: false,
    },
    [ComponentEventAction.GO_TO_PAGE]: {
        callId: 'utils',
        method: 'openPage',
        pageId: '',
        queryParams: [],
        hashParams: [],
        isOpenNewTab: false,
    },
    [ComponentEventAction.SET_TEMPORARY_STATE]: {
        callId: null,
        method: null,
        value: null,
    },
    [ComponentEventAction.SET_TEMPORARY_STATE]: {
        callId: 'localStorage',
        method: 'setValue',
        key: null,
        value: null,
    },
};

export default defineComponent({
    props: {
        documentModel: Object as PropType<DocumentModel>,
        editEvent: Object as PropType<IPublicTypeComponentEvent>,
        events: Array as PropType<EventOptionList>,
        onChange: Function as PropType<(data: IPublicTypeComponentEvent) => void>,
    },
    setup(props) {
        const innerEditEvent = ref({ ...props.editEvent });

        watch(() => props.editEvent, () => {
            innerEditEvent.value = {
                ...props.editEvent,
            };
        });
        const renderEvent = () => {
            return <Label label="Event">
                <FSelect v-model={innerEditEvent.value.name} options={props.events} />
            </Label>;
        };

        const currentAction = ref();
        const changeAction = () => {
            innerEditEvent.value = {
                id: innerEditEvent.value.id,
                name: innerEditEvent.value.name,
                onlyRunWhen: innerEditEvent.value.onlyRunWhen,
                debounce: innerEditEvent.value.debounce,
                action: innerEditEvent.value.action,
                ...initOptions[innerEditEvent.value.action],
            };
        };
        const renderAction = () => {
            return <Label label="Action">
                    <FSelect v-model={innerEditEvent.value.action} onChange={changeAction} >
                        {actions.map(action => <FOption value={action.value}>{action.label}</FOption>)}
                    </FSelect>
                </Label>;
        };
        const firstSeparatorText = computed(() => {
            const item = actions.find(item => item.value === currentAction.value);
            return item ? `${item.label}选项` : '选项';
        });

        const onSave = () => {
            props.onChange({
                ...innerEditEvent.value,
            });
        };

        return () => {
            return <div class={blockCls}>
                {renderEvent()}
                {renderAction()}
                <Separator text={firstSeparatorText.value} />
                <RenderOptions documentModel={props.documentModel} componentEvent={innerEditEvent.value} />
                <Separator text="高级" />
                <Label label="执行条件">
                    <FInput v-model={innerEditEvent.value.onlyRunWhen} />
                </Label>
                <Label label="Debounce">
                    <FInputNumber v-model={innerEditEvent.value.debounce} />
                </Label>
                <FSpace>
                    <FButton type="primary" size="small" onClick={onSave}>
                        保存
                    </FButton>
                </FSpace>
            </div>;
        };
    },
});
