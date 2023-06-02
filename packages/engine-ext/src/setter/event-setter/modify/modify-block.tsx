import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import { FInput, FInputNumber, FOption, FSelect } from '@fesjs/fes-design';
import { ComponentEventAction } from '@webank/letgo-types/es/component-event';
import type { EventOptionList } from '../interface';
import Label from './label';
import Separator from './separator';
import RenderOptions from './render-options';
import ModifyTitle from './modify-title';
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

export default defineComponent({
    props: {
        events: Array as PropType<EventOptionList>,
    },
    setup(props) {
        const renderEvent = () => {
            if (props.events.length > 1) {
                return <Label label="Event">
                    <FSelect options={props.events} />
                </Label>;
            }
            return null;
        };

        const currentAction = ref();
        const renderAction = () => {
            return <Label label="Action">
                    <FSelect v-model={currentAction}>
                        {actions.map(action => <FOption value={action.value}>{action.label}</FOption>)}
                    </FSelect>
                </Label>;
        };
        const firstSeparatorText = computed(() => {
            const item = actions.find(item => item.value === currentAction.value);
            return item ? `${item.label}选项` : '选项';
        });

        return () => {
            return <div class={blockCls}>
                <ModifyTitle title="编辑" />
                {renderEvent()}
                {renderAction()}
                <Separator text={firstSeparatorText.value} />
                <RenderOptions action={currentAction.value} />
                <Separator text="高级" />
                <Label label="执行条件">
                    <FInput />
                </Label>
                <Label label="Debounce">
                    <FInputNumber />
                </Label>
            </div>;
        };
    },
});
