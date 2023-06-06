import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IPublicTypeEventHandler } from '@webank/letgo-types';
import { DeleteOutlined } from '@fesjs/fes-design/icon';
import { activeEventCls, callExpressionCls, deleteIconCls, selectedEventCls, selectedEventListCls } from './event-handler-list.css';

export default defineComponent({
    name: 'EventHandlerList',
    props: {
        eventHandlers: Array as PropType<IPublicTypeEventHandler[]>,
        currentEventHandler: Object as PropType<IPublicTypeEventHandler>,
        onEdit: Function as PropType<(item: IPublicTypeEventHandler) => void>,
        onDelete: Function as PropType<(item: IPublicTypeEventHandler) => void>,
    },
    setup(props) {
        const getMethodCall = (item: IPublicTypeEventHandler) => {
            if (item.callId && item.method)
                return `${item.callId}.${item.method}()`;

            return '';
        };
        return () => {
            return <ul class={selectedEventListCls}>
                {props.eventHandlers.map(item => (
                    <li class={[selectedEventCls, item.id === props.currentEventHandler.id && activeEventCls]} onClick={() => props.onEdit(item)} key={item.id}>
                        {item.name}
                        <span class={callExpressionCls}>
                            {getMethodCall(item)}
                        </span>

                        <DeleteOutlined class={deleteIconCls} onClick={() => props.onDelete(item)} />
                    </li>
                ))}
            </ul>;
        };
    },
});
