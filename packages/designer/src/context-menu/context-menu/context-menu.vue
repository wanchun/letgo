<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { isEmpty } from 'lodash-es';
import Portal from './portal.vue';
import { addStyles, findSingle, focus, getHiddenElementOuterHeight, getHiddenElementOuterWidth, getViewport } from './dom';
import uniqueContextMenuId from './unique-context-menu-id';
import { findLastIndex } from './utils';
import type { InnerMenuItem, MenuItem } from './types';
import ContextMenuSub from './context-menu-sub.vue';
import './context-menu.less';

interface ItemInfo {
    index: number;
    level: number;
    parentKey?: string;
}

export default defineComponent({
    components: {
        Portal,
        ContextMenuSub,
    },
    props: {
        model: {
            type: Array as PropType<MenuItem[]>,
            default: () => [] as MenuItem[],
        },
        appendTo: {
            type: [String, Object],
            default: 'body',
        },
        autoZIndex: {
            type: Boolean,
            default: true,
        },
        baseZIndex: {
            type: Number,
            default: 0,
        },
        global: {
            type: Boolean,
            default: false,
        },
        tabindex: {
            type: Number,
            default: 0,
        },
    },
    setup(props, { expose }) {
        let pageX: number;
        let pageY: number;

        const menuId = uniqueContextMenuId();
        const containerRef = ref();
        const listRefEl = ref();
        const visible = ref();
        const activeItemPath = ref<InnerMenuItem[]>([]);
        const submenuVisible = ref<boolean>(false);

        const focusedItemInfo = ref<ItemInfo>({ index: -1, level: 0, parentKey: '' });

        function createProcessedItems(items: MenuItem[], level = 0, parent?: InnerMenuItem, parentKey = '') {
            const processedItems: InnerMenuItem[] = [];

            items
            && items.forEach((item, index) => {
                const key = (parentKey !== '' ? `${parentKey}_` : '') + index;
                const newItem: InnerMenuItem = {
                    item,
                    index,
                    level,
                    key,
                    parent,
                    parentKey,
                };
                if (item.items)
                    newItem.items = createProcessedItems(item.items, level + 1, newItem, key);

                processedItems.push(newItem);
            });

            return processedItems;
        }
        const processedItems = computed(() => {
            return createProcessedItems(props.model);
        });
        const visibleItems = computed(() => {
            const processedItem = activeItemPath.value.find(p => p.key === focusedItemInfo.value.parentKey);

            return processedItem ? processedItem.items || [] : processedItems.value;
        });

        const focused = ref(false);
        const focusedItemIdx = computed(() => {
            return focusedItemInfo.value.index !== -1
                ? `${menuId}${!isEmpty(focusedItemInfo.value.parentKey) ? `_${focusedItemInfo.value.parentKey}` : ''}_${focusedItemInfo.value.index}`
                : undefined;
        });

        function position() {
            let left = pageX + 1;
            let top = pageY + 1;
            const width = containerRef.value.offsetParent ? containerRef.value.offsetWidth : getHiddenElementOuterWidth(containerRef.value);
            const height = containerRef.value.offsetParent ? containerRef.value.offsetHeight : getHiddenElementOuterHeight(containerRef.value);
            const viewport = getViewport();

            // flip
            if (left + width - document.body.scrollLeft > viewport.width)
                left -= width;

            // flip
            if (top + height - document.body.scrollTop > viewport.height)
                top -= height;

            // fit
            if (left < document.body.scrollLeft)
                left = document.body.scrollLeft;

            // fit
            if (top < document.body.scrollTop)
                top = document.body.scrollTop;

            containerRef.value.style.left = `${left}px`;
            containerRef.value.style.top = `${top}px`;
        }

        function onEnter(el: Element) {
            if (el instanceof HTMLElement) {
                addStyles(el, { position: 'absolute' });
                position();

                if (props.autoZIndex)
                    el.style.zIndex = `${1000 + props.baseZIndex}`;
            }
        }

        function show(event: MouseEvent) {
            activeItemPath.value = [];
            focusedItemInfo.value = { index: -1, level: 0, parentKey: '' };
            // focus(listRefEl.value.$el);

            pageX = event.pageX;
            pageY = event.pageY;
            visible.value ? position() : (visible.value = true);

            event.stopPropagation();
            event.preventDefault();
        }

        function hide() {
            visible.value = false;
            activeItemPath.value = [];
            focusedItemInfo.value = { index: -1, level: 0, parentKey: '' };
        }

        let outsideClickListener: ((event: MouseEvent) => void) | null;
        function bindOutsideClickListener() {
            if (!outsideClickListener) {
                outsideClickListener = (event) => {
                    const isOutsideContainer = containerRef.value && !containerRef.value.contains(event.target);

                    if (isOutsideContainer && visible.value)
                        hide();
                };

                document.addEventListener('click', outsideClickListener);
            }
        }
        function unbindOutsideClickListener() {
            if (outsideClickListener) {
                document.removeEventListener('click', outsideClickListener);
                outsideClickListener = null;
            }
        }

        let resizeListener: (() => void) | null;
        function bindResizeListener() {
            if (resizeListener != null) {
                resizeListener = () => {
                    if (visible.value)
                        hide();
                };

                window.addEventListener('resize', resizeListener);
            }
        }
        function unbindResizeListener() {
            if (resizeListener) {
                window.removeEventListener('resize', resizeListener);
                resizeListener = null;
            }
        }

        function onAfterEnter() {
            bindOutsideClickListener();
            bindResizeListener();
        }

        function onAfterLeave(el: Element) {
            if (el instanceof HTMLElement) {
                if (props.autoZIndex)
                    el.style.zIndex = '';
            }

            unbindOutsideClickListener();
            unbindResizeListener();
        }

        function onFocus() {
            focused.value = true;
            focusedItemInfo.value = focusedItemInfo.value.index !== -1 ? focusedItemInfo.value : { index: -1, level: 0, parentKey: '' };
        }

        function onBlur() {
            focused.value = false;
            focusedItemInfo.value = { index: -1, level: 0, parentKey: '' };
        }

        function isValidItem(processedItem: MenuItem) {
            return !!processedItem && !processedItem.item.disabled && !processedItem.item.separator;
        }
        function isSelected(processedItem: MenuItem) {
            return activeItemPath.value.some(p => p.key === processedItem.key);
        }
        function isValidSelectedItem(processedItem: MenuItem) {
            return isValidItem(processedItem) && isSelected(processedItem);
        }

        function findFirstItemIndex() {
            return visibleItems.value.findIndex(processedItem => isValidItem(processedItem));
        }
        function findLastItemIndex() {
            return findLastIndex<MenuItem>(visibleItems.value, processedItem => isValidItem(processedItem));
        }
        function findLastFocusedItemIndex() {
            const selectedIndex = findSelectedItemIndex();

            return selectedIndex < 0 ? findLastItemIndex() : selectedIndex;
        }

        function findPrevItemIndex(index: number) {
            const matchedItemIndex = index > 0 ? findLastIndex<MenuItem>(visibleItems.value.slice(0, index), processedItem => isValidItem(processedItem)) : -1;

            return matchedItemIndex > -1 ? matchedItemIndex : index;
        }

        function findNextItemIndex(index: number) {
            const matchedItemIndex = index < visibleItems.value.length - 1 ? visibleItems.value.slice(index + 1).findIndex(processedItem => isValidItem(processedItem)) : -1;

            return matchedItemIndex > -1 ? matchedItemIndex + index + 1 : index;
        }

        function findSelectedItemIndex() {
            return visibleItems.value.findIndex(processedItem => isValidSelectedItem(processedItem));
        }

        function findFirstFocusedItemIndex() {
            const selectedIndex = findSelectedItemIndex();

            return selectedIndex < 0 ? findFirstItemIndex() : selectedIndex;
        }
        function scrollInView(index = -1) {
            const id = index !== -1 ? `${menuId}_${index}` : focusedItemIdx.value;
            const element = findSingle(listRefEl.value.$el, `li[id="${id}"]`);

            if (element)
                element.scrollIntoView && element.scrollIntoView({ block: 'nearest', inline: 'start' });
        }
        function changeFocusedItemIndex(index: number) {
            if (focusedItemInfo.value.index !== index) {
                focusedItemInfo.value.index = index;
                scrollInView();
            }
        }

        function onArrowDownKey(event: KeyboardEvent) {
            const itemIndex = focusedItemInfo.value.index !== -1 ? findNextItemIndex(focusedItemInfo.value.index) : findFirstFocusedItemIndex();

            changeFocusedItemIndex(itemIndex);
            event.preventDefault();
        }

        function isProccessedItemGroup(processedItem: MenuItem) {
            return processedItem && !isEmpty(processedItem.items);
        }

        function onItemChange(params: { processedItem: InnerMenuItem; isFocus?: boolean }) {
            const { processedItem, isFocus } = params;

            if (isEmpty(processedItem))
                return;

            const { index, key, level, parentKey, items } = processedItem;
            const grouped = !isEmpty(items);
            const currentItemPath: InnerMenuItem[] = activeItemPath.value.filter(p => p.parentKey !== parentKey && p.parentKey !== key);

            if (grouped) {
                currentItemPath.push(processedItem);
                submenuVisible.value = true;
            }

            focusedItemInfo.value = { index, level, parentKey: parentKey || '' };
            activeItemPath.value = currentItemPath;

            isFocus && focus(listRefEl.value.$el);
        }
        function onArrowUpKey(event: KeyboardEvent) {
            if (event.altKey) {
                if (focusedItemInfo.value.index !== -1) {
                    const processedItem = visibleItems.value[focusedItemInfo.value.index];
                    const grouped = isProccessedItemGroup(processedItem);

                    !grouped && onItemChange({ processedItem });
                }
                event.preventDefault();
            }
            else {
                const itemIndex = focusedItemInfo.value.index !== -1 ? findPrevItemIndex(focusedItemInfo.value.index) : findLastFocusedItemIndex();

                changeFocusedItemIndex(itemIndex);
                event.preventDefault();
            }
        }

        function onArrowLeftKey(event: KeyboardEvent) {
            const processedItem = visibleItems.value[focusedItemInfo.value.index];
            const parentItem = activeItemPath.value.find(p => p.key === processedItem.parentKey);
            const root = isEmpty(processedItem.parent);

            if (!root) {
                focusedItemInfo.value = { index: -1, level: 0, parentKey: parentItem?.parentKey || '' };
                onArrowDownKey(event);
            }

            activeItemPath.value = activeItemPath.value.filter(p => p.parentKey !== focusedItemInfo.value.parentKey);

            event.preventDefault();
        }

        function onArrowRightKey(event: KeyboardEvent) {
            const processedItem = visibleItems.value[focusedItemInfo.value.index];
            const grouped = isProccessedItemGroup(processedItem);

            if (grouped) {
                onItemChange({ processedItem });
                focusedItemInfo.value = { index: -1, level: 0, parentKey: processedItem.key };
                onArrowDownKey(event);
            }

            event.preventDefault();
        }
        function onHomeKey(event: KeyboardEvent) {
            changeFocusedItemIndex(findFirstItemIndex());
            event.preventDefault();
        }
        function onEndKey(event: KeyboardEvent) {
            changeFocusedItemIndex(findLastItemIndex());
            event.preventDefault();
        }

        function onEnterKey(event: KeyboardEvent) {
            if (focusedItemInfo.value.index !== -1) {
                const element = findSingle(listRefEl.value.$el, `li[id="${`${focusedItemIdx.value}`}"]`);
                const anchorElement = element && findSingle(element, 'a[data-pc-section="action"]');

                if (element instanceof HTMLElement && anchorElement instanceof HTMLElement)
                    anchorElement ? anchorElement.click() : element && element.click();

                const processedItem = visibleItems.value[focusedItemInfo.value.index];
                const grouped = isProccessedItemGroup(processedItem);

                !grouped && (focusedItemInfo.value.index = findFirstFocusedItemIndex());
            }

            event.preventDefault();
        }
        function onSpaceKey(event: KeyboardEvent) {
            onEnterKey(event);
        }

        function onEscapeKey(event: KeyboardEvent) {
            hide();
            event.preventDefault();
        }
        function onTabKey(event: KeyboardEvent) {
            if (focusedItemInfo.value.index !== -1) {
                const processedItem = visibleItems.value[focusedItemInfo.value.index];
                const grouped = isProccessedItemGroup(processedItem);

                !grouped && onItemChange({ processedItem });
            }

            hide();
        }

        function onKeyDown(event: KeyboardEvent) {
            switch (event.code) {
                case 'ArrowDown':
                    onArrowDownKey(event);
                    break;

                case 'ArrowUp':
                    onArrowUpKey(event);
                    break;

                case 'ArrowLeft':
                    onArrowLeftKey(event);
                    break;

                case 'ArrowRight':
                    onArrowRightKey(event);
                    break;

                case 'Home':
                    onHomeKey(event);
                    break;

                case 'End':
                    onEndKey(event);
                    break;

                case 'Space':
                    onSpaceKey(event);
                    break;

                case 'Enter':
                case 'NumpadEnter':
                    onEnterKey(event);
                    break;

                case 'Escape':
                    onEscapeKey(event);
                    break;

                case 'Tab':
                    onTabKey(event);
                    break;

                case 'PageDown':
                case 'PageUp':
                case 'Backspace':
                case 'ShiftLeft':
                case 'ShiftRight':
                    // NOOP
                    break;
            }
        }

        function onItemClick(params: { processedItem: InnerMenuItem }) {
            const { processedItem } = params;
            const grouped = isProccessedItemGroup(processedItem);
            const selected = isSelected(processedItem);

            if (selected) {
                const { index, key, level, parentKey } = processedItem;

                activeItemPath.value = activeItemPath.value.filter(p => key !== p.key && key.startsWith(p.key));
                focusedItemInfo.value = { index, level, parentKey };

                focus(listRefEl.value.$el);
            }
            else {
                grouped ? onItemChange(params) : hide();
            }
        }

        function onItemMouseEnter(params: { processedItem: InnerMenuItem }) {
            onItemChange(params);
        }
        function onItemMouseMove(params: { processedItem: InnerMenuItem }) {
            if (focused.value)
                changeFocusedItemIndex(params.processedItem.index);
        }

        watch(activeItemPath, (val) => {
            if (!isEmpty(val)) {
                bindOutsideClickListener();
                bindResizeListener();
            }
            else if (!visible.value) {
                unbindOutsideClickListener();
                unbindResizeListener();
            }
        });

        expose({
            show,
        });

        return {
            visible,
            containerRef,

            id: menuId,
            processedItems,

            activeItemPath,
            submenuVisible,

            focused,
            focusedItemIdx,

            onEnter,
            onAfterEnter,
            onAfterLeave,

            onFocus,
            onBlur,
            onKeyDown,

            onItemClick,
            onItemMouseMove,
            onItemMouseEnter,
        };
    },
});
</script>

<template>
    <Portal :append-to="appendTo">
        <transition name="p-contextmenu" @enter="onEnter" @after-enter="onAfterEnter" @after-leave="onAfterLeave">
            <div v-if="visible" ref="containerRef" class="p-contextmenu">
                <ContextMenuSub
                    :id="`${id}_list`"
                    ref="listRefEl"
                    class="p-contextmenu-root-list"
                    :root="true"
                    :tabindex="tabindex"
                    :menu-id="id"
                    :focused-item-id="focused ? focusedItemIdx : undefined"
                    :items="processedItems"
                    :active-item-path="activeItemPath"
                    :level="0"
                    :visible="submenuVisible"
                    @focus="onFocus"
                    @blur="onBlur"
                    @keydown="onKeyDown"
                    @item-click="onItemClick"
                    @item-mouseenter="onItemMouseEnter"
                    @item-mousemove="onItemMouseMove"
                />
            </div>
        </transition>
    </Portal>
</template>
