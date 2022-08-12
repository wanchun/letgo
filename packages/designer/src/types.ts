import { NodeSchema, PageSchema, ComponentSchema } from '@webank/letgo-types';
import { Node, NodeChildren } from './node';
import { Document } from './document';

export interface ISimulator {
    readonly isSimulator: true;
}

export type GetDataType<T, NodeType> = T extends undefined
    ? NodeType extends {
          schema: infer R;
      }
        ? R
        : any
    : T;

export interface ParentalNode<T extends NodeSchema = NodeSchema>
    extends Node<T> {
    readonly children: NodeChildren;
}

export interface LeafNode extends Node {
    readonly children: null;
}

export type PageNode = ParentalNode<PageSchema>;

export type ComponentNode = ParentalNode<ComponentSchema>;

export type RootNode = PageNode | ComponentNode;

export function isNode(node: any): node is Node {
    return node && node.isNode;
}

export function isRootNode(node: Node): node is RootNode {
    return node && node.isRoot();
}

export function isDocument(obj: any): obj is Document {
    return obj && obj.rootNode;
}
