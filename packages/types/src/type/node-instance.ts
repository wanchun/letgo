import type {
    IPublicModelNode,
    IPublicTypeComponentRecord,
} from '..';

export interface IPublicTypeNodeInstance<
    T = IPublicTypeComponentRecord,
> {
    docId: string
    nodeId: string
    instance: T
    node?: IPublicModelNode | null
}
