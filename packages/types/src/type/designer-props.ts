import type { Component } from 'vue';
import type {
    IPublicEditor,
    IPublicModelDesigner,
    IPublicTypeComponentMetadata,
    IPublicTypeProjectSchema,
    IPublicTypeSimulatorProps,
} from '..';

export interface IPublicTypeDesignerProps {
    editor: IPublicEditor
    defaultSchema?: IPublicTypeProjectSchema
    simulatorProps?: IPublicTypeSimulatorProps | ((designer: IPublicModelDesigner) => IPublicTypeSimulatorProps)
    simulatorComponent?: Component
    componentMetadatas?: IPublicTypeComponentMetadata[]
    onDragstart?: (e: ILocateEvent) => void
    onDrag?: (e: ILocateEvent) => void
    onDragend?: (
        e: { dragObject: IDragObject, copy: boolean },
        loc?: DropLocation,
    ) => void
    [key: string]: unknown
}
