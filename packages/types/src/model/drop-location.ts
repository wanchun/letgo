import type {
    IPublicModelDocumentModel,
    IPublicModelNode,
    IPublicTypeLocateEvent,
    IPublicTypeLocationDetail,
} from '..';

export interface IPublicModelDropLocation<
> {
    readonly target: IPublicModelNode

    readonly detail: IPublicTypeLocationDetail

    readonly event: IPublicTypeLocateEvent

    readonly source: string

    get document(): IPublicModelDocumentModel

    clone(event: IPublicTypeLocateEvent): IPublicModelDropLocation
}
