import type {
    IPublicModelNode,
    IPublicTypeComponentRecord,
} from '..';

export interface IPublicTypeNodeSelector<Node = IPublicModelNode> {
    node: Node
    instance?: IPublicTypeComponentRecord
}
