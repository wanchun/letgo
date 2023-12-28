import type {
    IPublicModelDropLocation,
    IPublicTypeDragObject,
    IPublicTypeLocateEvent,
    IPublicTypeLocationData,
    IPublicTypeSensor,
} from '..';

export interface IPublicModelDragon {
    get activeSensor(): IPublicTypeSensor | undefined

    get dragging(): boolean

    get dropLocation(): IPublicModelDropLocation

    from(shell: Element, boost: (e: MouseEvent) => IPublicTypeDragObject | null): () => void

    boost(dragObject: IPublicTypeDragObject, boostEvent: MouseEvent | DragEvent): void

    addSensor(sensor: IPublicTypeSensor): void

    removeSensor(sensor: IPublicTypeSensor): void

    createLocation(locationData: IPublicTypeLocationData): IPublicModelDropLocation

    clearLocation(): void

    onDropLocationChange(func: (loc: IPublicModelDropLocation) => any): () => void

    onDragstart(func: (e: IPublicTypeLocateEvent) => any): () => void

    onDrag(func: (e: IPublicTypeLocateEvent) => any): () => void

    onDragend(func: (x: { dragObject: IPublicTypeDragObject, copy: boolean }) => any): () => void
}
