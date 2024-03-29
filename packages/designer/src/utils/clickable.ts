import type { INode } from '../types';
import { canClickNode, getClosestNode } from './node-helper';

/**
 * 获取离当前节点最近的可点击节点
 * @param currentNode
 * @param event
 */
export function getClosestClickableNode(currentNode: INode | undefined | null,
    event: MouseEvent) {
    let node = currentNode;
    while (node) {
        // 判断当前节点是否可点击
        let canClick = canClickNode(node, event);

        const lockedNode = getClosestNode(node!, (n) => {
            // 假如当前节点就是 locked 状态，要从当前节点的父节点开始查找
            return !!(node?.isLocked ? n.parent?.isLocked : n.isLocked);
        });
        if (lockedNode && lockedNode.id !== node.id)
            canClick = false;

        if (canClick)
            break;

        // 对于不可点击的节点, 继续向上找
        node = node.parent;
    }
    return node;
}
