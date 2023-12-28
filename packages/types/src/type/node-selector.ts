import type {
    IPublicModelNode,
    IPublicTypeComponentRecord,
} from '..';

export interface IPublicTypeNodeSelector {
    node: IPublicModelNode
    instance?: IPublicTypeComponentRecord
}
