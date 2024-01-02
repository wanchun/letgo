import type {
    IPublicModelNode,
    IPublicTypeLocationChildrenDetail,
    IPublicTypeLocationPropDetail,
} from '..';

export type IPublicTypeLocationDetail<Node = IPublicModelNode> =
    | IPublicTypeLocationChildrenDetail<Node>
    | IPublicTypeLocationPropDetail
    | { type: string, [key: string]: any };
