import { defineComponent, ref } from 'vue';
import { actionCls, activeActionCls, leftActionsCls } from './left-actions.css';

export default defineComponent({
    setup() {
        const actions = [{
            value: 'general',
            label: '通用',
        }, {
            value: 'response',
            label: '响应',
        }, {
            value: 'advanced',
            label: '高级',
        }];

        const activeActionValue = ref('general');
        const selectAction = (action: { value: string; label: string }) => {
            activeActionValue.value = action.value;
        };

        const renderActions = () => {
            return actions.map((action) => {
                return <button class={[actionCls, activeActionValue.value === action.value ? activeActionCls : '']} onClick={() => selectAction(action)}>{action.label}</button>;
            });
        };

        return () => {
            return <div class={leftActionsCls} >
                {renderActions()}
            </div>;
        };
    },
});
