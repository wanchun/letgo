import type {
    IPublicModelDocumentModel,
    IPublicModelNode,
    IPublicTypeLocateEvent,
    IPublicTypeLocationDetail,
} from '..';

export interface IPublicTypeLocationData<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {
    target: Node // shadowNode | ConditionFlow | ElementNode | IRootNode
    detail: IPublicTypeLocationDetail<Node>
    source: string
    event: IPublicTypeLocateEvent<DocumentModel, Node>
}

export function isLocationData<DocumentModel = IPublicModelDocumentModel, Node = IPublicModelNode>(obj: any): obj is IPublicTypeLocationData<DocumentModel, Node> {
    return obj && obj.target && obj.detail;
}
