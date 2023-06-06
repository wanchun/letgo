import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IPublicTypeEventHandler } from '@webank/letgo-types';
import { DeleteOutlined } from '@fesjs/fes-design/icon';
import { activeEventCls, callExpressionCls, deleteIconCls, selectedEventCls, selectedEventListCls } from './event-handler-list.css';

export default defineComponent({
    name: 'EventHandlerList',
    props: {
        eventHandlers: {
            type: Array as PropType<IPublicTypeEventHandler[]>,
            default: () => [] as IPublicTypeEventHandler[],
        },
        currentEventHandler: Object as PropType<IPublicTypeEventHandler>,
        onEdit: Function as PropType<(item: IPublicTypeEventHandler) => void>,
        onDelete: Function as PropType<(item: IPublicTypeEventHandler) => void>,
        visibleName: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const getMethodCall = (item: IPublicTypeEventHandler) => {
            if (item.callId && item.method)
                return `${item.callId}.${item.method}()`;

            return '';
        };
        const deleteItem = (event: Event, item: IPublicTypeEventHandler) => {
            event.stopPropagation();
            props.onDelete(item);
        };
        return () => {
            return <ul class={selectedEventListCls}>
                {props.eventHandlers.map(item => (
                    <li class={[selectedEventCls, item.id === props.currentEventHandler?.id && activeEventCls]} onClick={() => props.onEdit(item)} key={item.id}>
                        {props.visibleName && item.name}
                        <span class={callExpressionCls}>
                            {getMethodCall(item)}
                        </span>

                        <DeleteOutlined class={deleteIconCls} onClick={(event: Event) => deleteItem(event, item)} />
                    </li>
                ))}
            </ul>;
        };
    },
});
