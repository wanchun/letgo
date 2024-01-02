import type {
    IPublicModelDocumentModel,
    IPublicModelNode,
    IPublicTypeLocateEvent,
    IPublicTypeLocationDetail,
} from '..';

export interface IPublicModelDropLocation<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {
    readonly target: Node

    readonly detail: IPublicTypeLocationDetail<Node>

    readonly event: IPublicTypeLocateEvent<DocumentModel, Node>

    readonly source: string

    get document(): DocumentModel

    clone(event: IPublicTypeLocateEvent<DocumentModel, Node>): IPublicModelDropLocation<DocumentModel, Node>
}
