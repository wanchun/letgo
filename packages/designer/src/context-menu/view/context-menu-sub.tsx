import type { PropType } from 'vue';
import { Transition, defineComponent, ref } from 'vue';
import { isEmpty } from 'lodash-es';
import { nestedPosition } from '@webank/letgo-common';
import type { InnerMenuItem } from './types';
import ArrowRight from './arrow-right';

const ContextMenuSub = defineComponent({
    emits: ['focus', 'blur', 'keydown'],
    props: {
        items: {
            type: Array as PropType<InnerMenuItem[]>,
            default: null,
        },
        menuId: {
            type: String,
            default: null,
        },
        focusedItemId: {
            type: String,
            default: null,
        },
        root: {
            type: Boolean,
            default: false,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        level: {
            type: Number,
            default: 0,
        },
        activeItemPath: {
            type: Array as PropType<InnerMenuItem[]>,
            default: () => [] as InnerMenuItem[],
        },
        tabindex: {
            type: Number,
            default: 0,
        },
        onItemClick: {
            type: Function as PropType<(params: { processedItem: InnerMenuItem; isFocus?: boolean }) => void>,
        },
        onItemMouseenter: {
            type: Function as PropType<(params: { processedItem: InnerMenuItem; isFocus?: boolean }) => void>,
        },
        onItemMousemove: {
            type: Function as PropType<(params: { processedItem: InnerMenuItem; isFocus?: boolean }) => void>,
        },
    },
    setup(props) {
        const container = ref();

        const onEnter = () => {
            nestedPosition(container.value, props.level);
        };

        function getItemId(processedItem: InnerMenuItem) {
            return `${props.menuId}_${processedItem.key}`;
        }

        function isItemActive(processedItem: InnerMenuItem) {
            return props.activeItemPath.some(path => path.key === processedItem.key);
        }
        function isItemFocused(processedItem: InnerMenuItem) {
            return props.focusedItemId === getItemId(processedItem);
        }
        function isItemDisabled(processedItem: InnerMenuItem) {
            return processedItem.item.disabled;
        }

        const genMenuItemCss = (processItem: InnerMenuItem) => {
            return [
                'letgo-menuitem',
                {
                    'letgo-menuitem-active letgo-highlight': isItemActive(processItem),
                    'letgo-focus': isItemFocused(processItem),
                    'letgo-menuitem-disabled': isItemDisabled(processItem),
                },
            ];
        };

        function onInnerItemClick(event: MouseEvent, processedItem: InnerMenuItem) {
            if (processedItem.item.command) {
                processedItem.item.command({
                    originalEvent: event,
                    item: processedItem.item,
                });
            }
            props.onItemClick({ processedItem, isFocus: true });
        }
        function onInnerItemMouseEnter(processedItem: InnerMenuItem) {
            props.onItemMouseenter({ processedItem });
        }
        function onInnerItemMouseMove(processedItem: InnerMenuItem) {
            props.onItemMousemove({ processedItem, isFocus: true });
        }

        function isItemGroup(processedItem: InnerMenuItem) {
            return !isEmpty(processedItem.items);
        }
        function isItemVisible(processedItem: InnerMenuItem) {
            return processedItem.item.visible !== false;
        }

        return () => {
            return (
                <Transition name="letgo-contextmenusub" onEnter={onEnter}>
                    {(props.root || props.visible) && (
                        <div ref={container} tabindex={props.tabindex}>
                            {props.items.map((processedItem) => {
                                if (isItemVisible(processedItem) && !processedItem.item.separator) {
                                    return (
                                        <div style={processedItem.item.style} class={genMenuItemCss(processedItem)}>
                                            <div
                                                class="letgo-menuitem-content"
                                                onClick={$event => onInnerItemClick($event, processedItem)}
                                                onMouseenter={() => onInnerItemMouseEnter(processedItem)}
                                                onMousemove={() => onInnerItemMouseMove(processedItem)}
                                            >
                                                <a
                                                    href={processedItem.item.url}
                                                    class="letgo-menuitem-link"
                                                    target={processedItem.item.target}
                                                    tabindex="-1"
                                                >
                                                    <span class="letgo-menuitem-text">{ processedItem.item.label }</span>
                                                    {processedItem.items?.length && <ArrowRight /> }
                                                </a>
                                            </div>
                                            {
                                                isItemVisible(processedItem) && isItemGroup(processedItem) && (
                                                    <ContextMenuSub
                                                        class="letgo-submenu-list"
                                                        menu-id={props.menuId}
                                                        focused-item-id={props.focusedItemId}
                                                        items={processedItem.items}
                                                        active-item-path={props.activeItemPath}
                                                        level={props.level + 1}
                                                        visible={isItemActive(processedItem) && isItemGroup(processedItem)}
                                                        onItemClick={props.onItemClick}
                                                        onItemMousemove={props.onItemMousemove}
                                                        onItemMouseenter={props.onItemMouseenter}
                                                    />
                                                )
                                            }
                                        </div>
                                    );
                                }
                                if (isItemVisible(processedItem) && processedItem.item.separator)

                                    <div style={processedItem.item.style} class="letgo-menuitem-separator" />;

                                return null;
                            })}
                        </div>
                    )}

                </Transition>
            );
        };
    },
});

export default ContextMenuSub;
