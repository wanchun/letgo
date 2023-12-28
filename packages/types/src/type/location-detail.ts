import type {
    IPublicTypeLocationChildrenDetail,
    IPublicTypeLocationPropDetail,
} from '..';

export type IPublicTypeLocationDetail =
    | IPublicTypeLocationChildrenDetail
    | IPublicTypeLocationPropDetail
    | { type: string, [key: string]: any };
