// 仅使用类型
import { Node } from '../node';

export const getClosestNode = (
    node: Node,
    until: (node: Node) => boolean,
): Node | undefined => {
    if (!node) {
        return undefined;
    }
    if (until(node)) {
        return node;
    } else {
        return getClosestNode(node.parent, until);
    }
};

/**
 * 判断节点是否可被点击
 * @param {Node} node 节点
 * @param {unknown} e 点击事件
 * @returns {boolean} 是否可点击，true表示可点击
 */
export const canClickNode = (node: Node, e: unknown): boolean => {
    const onClickHook =
        node.componentMeta?.getMetadata().configure?.advanced?.callbacks
            ?.onClickHook;
    const canClick =
        typeof onClickHook === 'function'
            ? onClickHook(e as MouseEvent, node)
            : true;
    return canClick;
};
