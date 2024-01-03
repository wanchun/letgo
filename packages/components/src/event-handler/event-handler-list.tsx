import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { IEnumEventHandlerAction } from '@webank/letgo-types';
import type { IEventHandler } from '@webank/letgo-types';
import { DeleteOutlined } from '@fesjs/fes-design/icon';
import './event-handler-list.less';

export default defineComponent({
    name: 'EventHandlerList',
    props: {
        eventHandlers: {
            type: Array as PropType<IEventHandler[]>,
            default: () => [] as IEventHandler[],
        },
        currentEventHandler: Object as PropType<IEventHandler>,
        onEdit: Function as PropType<(item: IEventHandler) => void>,
        onDelete: Function as PropType<(item: IEventHandler) => void>,
        visibleName: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const getMethodCall = (item: IEventHandler) => {
            if (item.namespace && item.action === IEnumEventHandlerAction.RUN_FUNCTION)
                return `${item.namespace}()`;

            if (item.namespace && item.method)
                return `${item.namespace}.${item.method}()`;

            return '';
        };
        const deleteItem = (event: Event, item: IEventHandler) => {
            event.stopPropagation();
            props.onDelete(item);
        };
        return () => {
            return (
                <ul class="letgo-comp-event__list">
                    {props.eventHandlers.map(item => (
                        <li class={['letgo-comp-event__list-item', item.id === props.currentEventHandler?.id && 'letgo-comp-event__list-item--active']} onClick={() => props.onEdit(item)} key={item.id}>
                            {props.visibleName && item.name}
                            <span class="letgo-comp-event__list-call">
                                {getMethodCall(item)}
                            </span>

                            <DeleteOutlined class="letgo-comp-event__list-icon" onClick={(event: Event) => deleteItem(event, item)} />
                        </li>
                    ))}
                </ul>
            );
        };
    },
});
