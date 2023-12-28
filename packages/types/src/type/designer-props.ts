import type { Component } from 'vue';
import type {
    IPublicEditor,
    IPublicModelDesigner,
    IPublicModelDropLocation,
    IPublicTypeComponentMetadata,
    IPublicTypeDragObject,
    IPublicTypeLocateEvent,
    IPublicTypeProjectSchema,
    IPublicTypeSimulatorProps,
} from '..';

export interface IPublicTypeDesignerProps {
    editor: IPublicEditor
    defaultSchema?: IPublicTypeProjectSchema
    simulatorProps?: IPublicTypeSimulatorProps | ((designer: IPublicModelDesigner) => IPublicTypeSimulatorProps)
    simulatorComponent?: Component
    componentMetadatas?: IPublicTypeComponentMetadata[]
    onDragstart?: (e: IPublicTypeLocateEvent) => void
    onDrag?: (e: IPublicTypeLocateEvent) => void
    onDragend?: (
        e: { dragObject: IPublicTypeDragObject, copy: boolean },
        loc?: IPublicModelDropLocation,
    ) => void
    [key: string]: unknown
}
