import {
    IPublicEnumLocationDetail,
} from '..';
import type {
    IPublicModelNode,
    IPublicTypeRect,
} from '..';

export interface IPublicTypeLocationChildrenDetail<
    Node = IPublicModelNode,
> {
    type: IPublicEnumLocationDetail.Children
    index?: number | null
    /**
     * 是否有效位置
     */
    valid?: boolean
    edge?: DOMRect
    near?: {
        node: Node
        pos: 'before' | 'after' | 'replace'
        rect?: IPublicTypeRect
        align?: 'V' | 'H'
    }
    focus?: { type: 'slots' } | { type: 'node', node: Node }
}

export function isLocationChildrenDetail<Node = IPublicModelNode>(
    obj: any,
): obj is IPublicTypeLocationChildrenDetail<Node> {
    return obj && obj.type === IPublicEnumLocationDetail.Children;
}
