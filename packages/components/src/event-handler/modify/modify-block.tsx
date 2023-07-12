import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton, FInput, FInputNumber, FOption, FSelect, FSpace } from '@fesjs/fes-design';
import type { IPublicTypeEventHandler } from '@harrywan/letgo-types';
import { InnerEventHandlerAction } from '@harrywan/letgo-types';
import type { DocumentModel } from '@harrywan/letgo-designer';
import Label from './label';
import Separator from './separator';
import RenderOptions from './render-options';
import { blockCls } from './modify-block.css';

const actions = [{
    value: InnerEventHandlerAction.CONTROL_QUERY,
    label: '控制查询',
}, {
    value: InnerEventHandlerAction.CONTROL_COMPONENT,
    label: '控制组件',
}, {
    value: InnerEventHandlerAction.SET_TEMPORARY_STATE,
    label: '设置临时状态',
}, {
    value: InnerEventHandlerAction.SET_LOCAL_STORAGE,
    label: '设置本地存储',
}, {
    value: InnerEventHandlerAction.RUN_FUNCTION,
    label: '执行函数',
}];

const initOptions: any = {
    [InnerEventHandlerAction.CONTROL_QUERY]: {
        namespace: null,
        method: 'trigger',
    },
    [InnerEventHandlerAction.CONTROL_COMPONENT]: {
        namespace: null,
        method: null,
    },
    [InnerEventHandlerAction.SET_TEMPORARY_STATE]: {
        namespace: null,
        method: 'setValue',
        params: {
            value: null,
        },
    },
    [InnerEventHandlerAction.SET_LOCAL_STORAGE]: {
        namespace: 'localStorage',
        method: 'setValue',
        params: {
            value: null,
            key: null,
        },
    },
    [InnerEventHandlerAction.RUN_FUNCTION]: {
        namespace: null,
        method: null,
        funcBody: '',
    },
};

interface Option { label: string; value: string }

export default defineComponent({
    name: 'EventHandlerModify',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        editEvent: Object as PropType<IPublicTypeEventHandler>,
        events: {
            type: Array as PropType<Option[]>,
            default: () => [] as Option[],
        },
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
            return props.events.length
                ? <Label label="事件">
                <FSelect v-model={innerEditEvent.value.name} options={props.events} />
            </Label>
                : null;
        };

        const currentAction = ref();
        const changeAction = () => {
            innerEditEvent.value = {
                id: innerEditEvent.value.id,
                name: innerEditEvent.value.name,
                onlyRunWhen: innerEditEvent.value.onlyRunWhen,
                waitMs: innerEditEvent.value.waitMs,
                action: innerEditEvent.value.action,
                ...initOptions[innerEditEvent.value.action],
            };
        };
        const renderAction = () => {
            return <Label label="动作">
                    <FSelect appendToContainer={false} v-model={innerEditEvent.value.action} onChange={changeAction} >
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

        const changeCurrentEvent = (content: Record<string, any>) => {
            Object.assign(innerEditEvent.value, content);
        };

        return () => {
            return <div class={blockCls}>
                {renderEvent()}
                {renderAction()}
                <Separator text={firstSeparatorText.value} />
                <RenderOptions documentModel={props.documentModel} onChange={changeCurrentEvent} componentEvent={innerEditEvent.value} />
                <Separator text="高级" />
                <Label label="执行条件">
                    <FInput v-model={innerEditEvent.value.onlyRunWhen} />
                </Label>
                <Label label="延迟">
                    <FInputNumber v-model={innerEditEvent.value.waitMs} />
                </Label>
                <FSpace justify="end">
                    <FButton type="primary" size="small" onClick={onSave}>
                        保存
                    </FButton>
                </FSpace>
            </div>;
        };
    },
});
