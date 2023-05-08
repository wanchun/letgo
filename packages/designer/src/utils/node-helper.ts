// 仅使用类型
import type { INode } from '../types';

export function getClosestNode(node: INode,
    until: (node: INode) => boolean): INode | undefined {
    if (!node)
        return undefined;

    if (until(node))
        return node;
    else
        return getClosestNode(node.parent, until);
}

/**
 * 判断节点是否可被点击
 * @param {INode} node 节点
 * @param {unknown} e 点击事件
 * @returns {boolean} 是否可点击，true表示可点击
 */
export function canClickNode(node: INode, e: unknown): boolean {
    const onClickHook
        = node.componentMeta?.getMetadata().configure?.advanced?.callbacks
            ?.onClickHook;
    const canClick
        = typeof onClickHook === 'function'
            ? onClickHook(e as MouseEvent, node)
            : true;
    return canClick;
}
