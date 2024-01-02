import type {
    IPublicModelSimulator,
    IPublicTypeComponentRecord,
    IPublicTypeDragObject,
    IPublicTypeDropContainer,
    IPublicTypeLocateEvent,
    IPublicTypeLocationData,
    IPublicTypeNodeInstance,
    IPublicTypeNodeSelector,
    IPublicTypeScrollable,
    IPublicTypeSensor,
    IPublicTypeViewport,
} from '@webank/letgo-types';
import type { DocumentModel } from './document';
import type { ScrollTarget } from './designer';
import type { INode } from './node';

export type { INode, IPageNode, IComponentNode, ISlotNode, IRootNode } from './node';

export type ILocateEvent = IPublicTypeLocateEvent<DocumentModel, INode>;

export type ISensor = IPublicTypeSensor<DocumentModel, INode>;

export type IDragObject = IPublicTypeDragObject<INode>;

export type IScrollable = IPublicTypeScrollable<ScrollTarget>;

export type IViewport = IPublicTypeViewport<ScrollTarget>;

export function isDocumentModel(obj: any): obj is DocumentModel {
    return obj && obj.rootNode;
}

export type INodeInstance<T = IPublicTypeComponentRecord> = IPublicTypeNodeInstance<T, INode>;

export type IDropContainer = IPublicTypeDropContainer<INode>;

export type INodeSelector = IPublicTypeNodeSelector<INode>;

export type ILocationData = IPublicTypeLocationData<DocumentModel, INode>;

export interface ISimulator<P = object> extends IPublicModelSimulator<P, DocumentModel, INode> {
    viewport: IViewport
}

export function isSimulator(obj: any): obj is ISimulator {
    return obj && obj.isSimulator;
}

export const AutoFit = '100%';
