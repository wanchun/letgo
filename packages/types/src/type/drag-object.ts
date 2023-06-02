import { IPublicEnumDragObjectType } from '..';
import type {
    IPublicModelNode,
    IPublicTypeNodeSchema,
} from '..';

export interface IPublicTypeDragNodeObject {
    type: IPublicEnumDragObjectType.Node
    nodes: IPublicModelNode[]
}

export interface IPublicTypeDragNodeDataObject {
    type: IPublicEnumDragObjectType.NodeData
    data: IPublicTypeNodeSchema | IPublicTypeNodeSchema[]
    thumbnail?: string
    description?: string
    [extra: string]: any
}

export interface IPublicTypeDragAnyObject {
    type: string
    [key: string]: any
}

export type IPublicTypeDragObject = IPublicTypeDragNodeDataObject | IPublicTypeDragNodeObject | IPublicTypeDragAnyObject;

export function isDragNodeObject(obj: any): obj is IPublicTypeDragNodeObject {
    return obj && obj.type === IPublicEnumDragObjectType.Node;
}

export function isDragNodeDataObject(obj: any): obj is IPublicTypeDragNodeDataObject {
    return obj && obj.type === IPublicEnumDragObjectType.NodeData;
}

export function isDragAnyObject(obj: any): obj is IPublicTypeDragAnyObject {
    return (
        obj
        && obj.type !== IPublicEnumDragObjectType.NodeData
        && obj.type !== IPublicEnumDragObjectType.Node
    );
}
