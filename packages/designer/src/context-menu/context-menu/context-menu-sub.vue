<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { isEmpty } from 'lodash-es';
import { nestedPosition } from './dom';
import type { InnerMenuItem } from './types';
import ArrowRight from './arrow-right.vue';

export default defineComponent({
    name: 'ContextMenuSub',
    components: {
        ArrowRight,
    },
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
    },
    emits: ['item-click', 'item-mouseenter', 'item-mousemove'],
    setup(props, { emit }) {
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
                'p-menuitem',
                {
                    'p-menuitem-active p-highlight': isItemActive(processItem),
                    'p-focus': isItemFocused(processItem),
                    'p-disabled': isItemDisabled(processItem),
                },
            ];
        };

        function onItemClick(event: MouseEvent, processedItem: InnerMenuItem) {
            if (processedItem.item.command) {
                processedItem.item.command({
                    originalEvent: event,
                    item: processedItem.item,
                });
            }
            emit('item-click', { processedItem, isFocus: true });
        }
        function onItemMouseEnter(processedItem: InnerMenuItem) {
            emit('item-mouseenter', { processedItem });
        }
        function onItemMouseMove(processedItem: InnerMenuItem) {
            emit('item-mousemove', { processedItem, isFocus: true });
        }

        function isItemGroup(processedItem: InnerMenuItem) {
            return !isEmpty(processedItem.items);
        }
        function isItemVisible(processedItem: InnerMenuItem) {
            return processedItem.item.visible !== false;
        }

        return {
            container,

            genMenuItemCss,
            isItemActive,
            isItemFocused,
            isItemGroup,
            isItemVisible,

            getItemId,

            onEnter,
            onItemClick,
            onItemMouseEnter,
            onItemMouseMove,
        };
    },
});
</script>

<template>
    <transition name="p-contextmenusub" @enter="onEnter">
        <ul v-if="root ? true : visible" ref="container" :tabindex="tabindex">
            <template v-for="processedItem of items" :key="processedItem.menuId">
                <li v-if="isItemVisible(processedItem) && !processedItem.item.separator" :style="processedItem.item.style" :class="genMenuItemCss(processedItem)">
                    <div class="p-menuitem-content" @click="onItemClick($event, processedItem)" @mouseenter="onItemMouseEnter(processedItem)" @mousemove="onItemMouseMove(processedItem)">
                        <a :href="processedItem.item.url" class="p-menuitem-link" :target="processedItem.item.target" tabindex="-1">
                            <span v-if="processedItem.item.icon" class="p-menuitem-icon" :class="[processedItem.item.icon]" />
                            <span class="p-menuitem-text">{{ processedItem.item.label }}</span>
                            <template v-if="processedItem.items">
                                <ArrowRight class="p-submenu-icon" />
                            </template>
                        </a>
                    </div>
                    <ContextMenuSub
                        v-if="isItemVisible(processedItem) && isItemGroup(processedItem)"
                        :id="`${getItemId(processedItem)}_list`"
                        class="p-submenu-list"
                        :menu-id="menuId"
                        :focused-item-id="focusedItemId"
                        :items="processedItem.items"
                        :active-item-path="activeItemPath"
                        :level="level + 1"
                        :visible="isItemActive(processedItem) && isItemGroup(processedItem)"
                        @item-click="$emit('item-click', $event)"
                        @item-mouseenter="$emit('item-mouseenter', $event)"
                        @item-mousemove="$emit('item-mousemove', $event)"
                    />
                </li>
                <li v-if="isItemVisible(processedItem) && processedItem.item.separator" :style="processedItem.item.style" class="letgo-menuitem-separator" />
            </template>
        </ul>
    </transition>
</template>
