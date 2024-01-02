import { IPublicEnumDragObject } from '..';
import type {
    IPublicModelNode,
    IPublicTypeNodeSchema,
} from '..';

export interface IPublicTypeDragNodeObject<Node = IPublicModelNode> {
    type: IPublicEnumDragObject.Node
    nodes: Node[]
}

export interface IPublicTypeDragNodeDataObject {
    type: IPublicEnumDragObject.NodeData
    data: IPublicTypeNodeSchema | IPublicTypeNodeSchema[]
    thumbnail?: string
    description?: string
    [extra: string]: any
}

export interface IPublicTypeDragAnyObject {
    type: string & Exclude<IPublicEnumDragObject, IPublicEnumDragObject.NodeData | IPublicEnumDragObject.Node>
    [key: string]: any
}

export type IPublicTypeDragObject<Node = IPublicModelNode> = IPublicTypeDragNodeObject<Node> | IPublicTypeDragNodeDataObject | IPublicTypeDragAnyObject;

export function isDragNodeObject<Node = IPublicModelNode>(obj: any): obj is IPublicTypeDragNodeObject<Node> {
    return obj && obj.type === IPublicEnumDragObject.Node;
}

export function isDragNodeDataObject(obj: any): obj is IPublicTypeDragNodeDataObject {
    return obj && obj.type === IPublicEnumDragObject.NodeData;
}

export function isDragAnyObject(obj: any): obj is IPublicTypeDragAnyObject {
    return (
        obj
        && obj.type !== IPublicEnumDragObject.NodeData
        && obj.type !== IPublicEnumDragObject.Node
    );
}
