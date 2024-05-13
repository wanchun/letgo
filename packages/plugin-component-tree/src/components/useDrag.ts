import type { Ref, ShallowRef } from 'vue';
import { computed, nextTick, onUnmounted, ref, shallowRef } from 'vue';
import { useEventListener } from '@vueuse/core';
import { isUndefined } from 'lodash-es';
import type { DropInfo, DropPosition, InnerTreeNode, TreeNode, TreeNodeKey } from './const';

function allowDrop(node: TreeNode): boolean {
    return node.isContainer || node.children?.length > 0;
}

function getDropTarget(el?: HTMLElement) {
    if (!el)
        return;

    if (el === document.body)
        return;

    if (el.tagName === 'DIV' && Array.from(el.classList).includes('letgo-tree-node-wrapper'))
        return el;

    return getDropTarget(el.parentElement);
}

export default function useDrag({
    nodeMap,
    props,
    emit,
    dropInfo,
    rootRef,
}: {
    nodeMap: Map<string, InnerTreeNode>;
    emit: any;
    dropInfo: Ref<DropInfo>;
    props: any;
    rootRef: Ref<HTMLElement>;
}) {
    let overBeginTimeMap: { [propName: TreeNodeKey]: number } = {};
    let timer: number;

    const dragNode: ShallowRef<TreeNode | null> = shallowRef();

    const x = ref<number>();
    const y = ref<number>();

    let isDragging = false;

    let _dragNode: TreeNode;

    onUnmounted(() => {
        if (timer)
            clearTimeout(timer);
    });

    function resetDragState(): void {
        dragNode.value = null;
        dropInfo.value = null;
        overBeginTimeMap = {};
    }

    function isDraggable(node: TreeNode) {
        return !isUndefined(node.draggable)
            ? node.draggable
            : props.draggable;
    }

    let clearMousemove: () => void;
    let clearMouseUp: () => void;

    let rootRect: DOMRect;

    const rectCache = new Map<string, DOMRect>();

    const handleMousemove = (event: MouseEvent) => {
        if (!_dragNode)
            return;

        if (isDragging === false) {
            emit('dragstart', _dragNode);
            nextTick(() => {
                rootRect = rootRef.value.getBoundingClientRect();
            });
        }

        isDragging = true;
        dragNode.value = _dragNode;
        x.value = event.clientX;
        y.value = event.clientY;

        // 执行滚动
        if (rootRect) {
            const offset = (rootRect.bottom - rootRect.top) / 4;
            if (event.clientY > rootRect.bottom - offset) {
                rootRef.value.scrollTo({
                    left: 0,
                    top: rootRef.value.scrollTop + 8,
                });
            }
            if (event.clientY < rootRect.top + offset) {
                rootRef.value.scrollTo({
                    left: 0,
                    top: rootRef.value.scrollTop - 8,
                });
            }
        }

        const targetNodeEl = getDropTarget(event.target as HTMLElement);

        if (!targetNodeEl) {
            const clientY = event.clientY;
            if (!rootRect)
                rootRect = rootRef.value.getBoundingClientRect();

            if (!props.data?.length)
                return;

            if (clientY < rootRect.top) {
                const first = props.data[0] as TreeNode;
                dropInfo.value = {
                    dropNode: first,
                    index: 0,
                    dragNode: dragNode.value,
                    isAllow: true,
                };
            }
            // 跟root的paddingBottom保持一致
            if (clientY > rootRect.bottom - 16) {
                const last = props.data[props.data.length - 1] as TreeNode;
                dropInfo.value = {
                    dropNode: last,
                    index: last.children?.length ?? 0,
                    dragNode: dragNode.value,
                    isAllow: true,
                };
            }
            return;
        }

        const value = targetNodeEl.getAttribute('data-value');
        const node = nodeMap.get(value).origin;

        if (!node)
            return;

        emit('dragover', { node, event });

        // 悬浮1s以上展开节点
        if (!overBeginTimeMap[node.value]) {
            overBeginTimeMap[node.value] = Date.now();
        }
        else {
            if (
                Date.now() - overBeginTimeMap[node.value] > 1000
                && node.children?.length
            )
                node.isExpanded = true;
        }
        // 悬浮节点大小位置信息
        let rect = rectCache.get(value);
        if (!rect) {
            rect = targetNodeEl.getBoundingClientRect();
            rectCache.set(value, rect);
        }
        const { height: elHeight, y: elClientTop } = rect;

        let mousePosition: DropPosition;

        const eventOffsetY = event.clientY - elClientTop;

        const allowDropInside = allowDrop(node);

        if (eventOffsetY <= elHeight / 2)
            mousePosition = 'before';
        else
            mousePosition = allowDropInside ? 'inside' : 'after';

        let dropNode: TreeNode;
        let index: number;
        if (mousePosition === 'inside') {
            dropNode = node;
            index = 0;
        }
        else if (mousePosition === 'before') {
            dropNode = nodeMap.get(node.value).parent?.origin;
            index = dropNode?.children?.indexOf(node);
        }
        else {
            dropNode = nodeMap.get(node.value).parent?.origin;
            index = dropNode?.children?.indexOf(node) + 1;
        }

        const oldDropInfo = dropInfo.value;
        if (
            oldDropInfo?.dragNode?.value !== dragNode?.value?.value
            || oldDropInfo?.dropNode?.value !== dropNode?.value
            || oldDropInfo?.index !== index
        ) {
            if (dropNode && index > -1) {
                const isAllow = props.checkDrop(dropNode, dragNode.value);
                dropInfo.value = {
                    dropNode,
                    index,
                    dragNode: dragNode.value,
                    isAllow,
                };
                rectCache.clear();
            }
        }
    };

    const handleMouseup = (event: MouseEvent) => {
        if (!_dragNode)
            return;

        clearMousemove?.();
        clearMouseUp?.();

        isDragging = false;
        _dragNode = null;

        if (!dragNode.value)
            return;

        if (!dropInfo.value)
            return;

        emit('drop', {
            ...dropInfo.value,
            event,
        });

        resetDragState();
    };

    const handleMouseDown = (event: MouseEvent) => {
        // ESC or RightClick
        if (event.which === 3 || event.button === 2)
            return;

        const targetNodeEl = getDropTarget(event.target as HTMLElement);

        if (!targetNodeEl)
            return;

        const value = targetNodeEl.getAttribute('data-value');
        const node = nodeMap.get(value).origin;

        if (!isDraggable(node))
            return;

        _dragNode = node;

        isDragging = false;

        clearMousemove = useEventListener(document, 'mousemove', handleMousemove, true);

        clearMouseUp = useEventListener(document, 'mouseup', handleMouseup, true);
    };

    const dragHost = computed(() => {
        return {
            node: dragNode.value,
            x: x.value,
            y: y.value,
        };
    });

    return {
        handleMouseDown,
        dragHost,
    };
};
