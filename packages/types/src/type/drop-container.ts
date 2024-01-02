import type { IPublicModelNode, IPublicTypeComponentRecord } from '..';

export interface IPublicTypeDropContainer<
    Node = IPublicModelNode,
> {
    container: Node
    instance: IPublicTypeComponentRecord
}
