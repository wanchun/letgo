import type { Component } from 'vue';
import type {
    IPublicEditor,
    IPublicModelDesigner,
    IPublicModelDocumentModel,
    IPublicModelDropLocation,
    IPublicModelNode,
    IPublicTypeComponentMetadata,
    IPublicTypeDragObject,
    IPublicTypeLocateEvent,
    IPublicTypeProjectSchema,
    IPublicTypeSimulatorProps,
} from '..';

export interface IPublicTypeDesignerProps<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {
    editor: IPublicEditor
    defaultSchema?: IPublicTypeProjectSchema
    simulatorProps?: IPublicTypeSimulatorProps | ((designer: IPublicModelDesigner) => IPublicTypeSimulatorProps)
    simulatorComponent?: Component
    componentMetadatas?: IPublicTypeComponentMetadata[]
    onDragstart?: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => void
    onDrag?: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => void
    onDragend?: (
        e: { dragObject: IPublicTypeDragObject<Node>, copy: boolean },
        loc?: IPublicModelDropLocation<DocumentModel, Node>,
    ) => void
    [key: string]: unknown
}
