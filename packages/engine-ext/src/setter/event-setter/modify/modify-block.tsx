import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton, FInput, FInputNumber, FOption, FSelect, FSpace } from '@fesjs/fes-design';
import type { IPublicTypeEventHandler } from '@webank/letgo-types';
import { EventHandlerAction } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import type { EventOptionList } from '../interface';
import Label from './label';
import Separator from './separator';
import RenderOptions from './render-options';
import { blockCls } from './modify-block.css';

const actions = [{
    value: EventHandlerAction.CONTROL_QUERY,
    label: '控制查询',
}, {
    value: EventHandlerAction.CONTROL_COMPONENT,
    label: '控制组件',
}, {
    value: EventHandlerAction.GO_TO_URL,
    label: '应用跳转',
}, {
    value: EventHandlerAction.GO_TO_PAGE,
    label: '页面跳转',
}, {
    value: EventHandlerAction.SET_TEMPORARY_STATE,
    label: '设置临时状态',
}, {
    value: EventHandlerAction.SET_LOCAL_STORAGE,
    label: '设置本地存储',
}];

const initOptions: any = {
    [EventHandlerAction.CONTROL_QUERY]: {
        callId: null,
        method: 'trigger',
    },
    [EventHandlerAction.CONTROL_COMPONENT]: {
        method: null,
    },
    [EventHandlerAction.GO_TO_URL]: {
        callId: 'utils',
        method: 'openUrl',
        url: '',
        isOpenNewTab: false,
    },
    [EventHandlerAction.GO_TO_PAGE]: {
        callId: 'utils',
        method: 'openPage',
        pageId: '',
        queryParams: [],
        hashParams: [],
        isOpenNewTab: false,
    },
    [EventHandlerAction.SET_TEMPORARY_STATE]: {
        callId: null,
        method: 'setValue',
        value: null,
    },
    [EventHandlerAction.SET_LOCAL_STORAGE]: {
        callId: 'localStorage',
        method: 'setValue',
        key: null,
        value: null,
    },
};

export default defineComponent({
    name: 'ModifyBlock',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        editEvent: Object as PropType<IPublicTypeEventHandler>,
        events: Array as PropType<EventOptionList>,
        onChange: Function as PropType<(data: IPublicTypeEventHandler) => void>,
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
                waitMs: innerEditEvent.value.waitMs,
                action: innerEditEvent.value.action,
                callId: innerEditEvent.value.callId,
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
                    <FInputNumber v-model={innerEditEvent.value.waitMs} />
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
