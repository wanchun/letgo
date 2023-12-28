import type {
    IPublicEnumLocationDetail,
    IPublicModelNode,
    IPublicTypeRect,
} from '..';

export interface IPublicTypeLocationChildrenDetail {
    type: IPublicEnumLocationDetail.Children
    index?: number | null
    /**
     * 是否有效位置
     */
    valid?: boolean
    edge?: DOMRect
    near?: {
        node: IPublicModelNode
        pos: 'before' | 'after' | 'replace'
        rect?: IPublicTypeRect
        align?: 'V' | 'H'
    }
    focus?: { type: 'slots' } | { type: 'node', node: IPublicModelNode }
}
