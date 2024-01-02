import type {
    IPublicModelDocumentModel,
    IPublicModelDropLocation,
    IPublicModelNode,
    IPublicTypeDragObject,
    IPublicTypeLocateEvent,
    IPublicTypeLocationData,
    IPublicTypeSensor,
} from '..';

export interface IPublicModelDragon<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {
    get activeSensor(): IPublicTypeSensor<DocumentModel, Node> | undefined

    get dragging(): boolean

    get dropLocation(): IPublicModelDropLocation<DocumentModel, Node>

    from(shell: Element, boost: (e: MouseEvent) => IPublicTypeDragObject<Node> | null): () => void

    boost(dragObject: IPublicTypeDragObject<Node>, boostEvent: MouseEvent | DragEvent): void

    addSensor(sensor: IPublicTypeSensor<DocumentModel, Node>): void

    removeSensor(sensor: IPublicTypeSensor<DocumentModel, Node>): void

    createLocation(locationData: IPublicTypeLocationData<DocumentModel, Node>): IPublicModelDropLocation<DocumentModel, Node>

    clearLocation(): void

    onDropLocationChange(func: (loc: IPublicModelDropLocation<DocumentModel, Node>) => any): () => void

    onDragstart(func: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => any): () => void

    onDrag(func: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => any): () => void

    onDragend(func: (x: { dragObject: IPublicTypeDragObject<Node>, copy: boolean }) => any): () => void
}
