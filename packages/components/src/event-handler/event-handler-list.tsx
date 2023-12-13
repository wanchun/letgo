import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { InnerEventHandlerAction } from '@webank/letgo-types';
import type { IPublicTypeEventHandler } from '@webank/letgo-types';
import { DeleteOutlined } from '@fesjs/fes-design/icon';
import './event-handler-list.less';

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
            if (item.namespace && item.action === InnerEventHandlerAction.RUN_FUNCTION)
                return `${item.namespace}()`;

            if (item.namespace && item.method)
                return `${item.namespace}.${item.method}()`;

            return '';
        };
        const deleteItem = (event: Event, item: IPublicTypeEventHandler) => {
            event.stopPropagation();
            props.onDelete(item);
        };
        return () => {
            return <ul class="letgo-comp-event__list">
                {props.eventHandlers.map(item => (
                    <li class={["letgo-comp-event__list-item", item.id === props.currentEventHandler?.id && "letgo-comp-event__list-item--active"]} onClick={() => props.onEdit(item)} key={item.id}>
                        {props.visibleName && item.name}
                        <span class="letgo-comp-event__list-call">
                            {getMethodCall(item)}
                        </span>

                        <DeleteOutlined class="letgo-comp-event__list-icon" onClick={(event: Event) => deleteItem(event, item)} />
                    </li>
                ))}
            </ul>;
        };
    },
});
