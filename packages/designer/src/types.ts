import { Component } from 'vue';
import { NodeSchema, PageSchema, ComponentSchema } from '@webank/letgo-types';
import { Node, NodeChildren } from './node';
import { Document } from './document';
import { LocateEvent } from './designer/dragon';

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

export interface NodeInstance<T = ComponentInstance> {
    docId: string;
    nodeId: string;
    instance: T;
    node?: Node | null;
}

/**
 * 组件实例定义
 */
export type ComponentInstance = Element | Component<any> | object;

export interface ISensor {
    /**
     * 是否可响应，比如面板被隐藏，可设置该值 false
     */
    readonly sensorAvailable: boolean;
    /**
     * 给事件打补丁
     */
    fixEvent(e: LocateEvent): LocateEvent;
    /**
     * 定位并激活
     */
    locate(e: LocateEvent): DropLocation | undefined | null;
    /**
     * 是否进入敏感板区域
     */
    isEnter(e: LocateEvent): boolean;
    /**
     * 取消激活
     */
    deActiveSensor(): void;
    /**
     * 获取节点实例
     */
    getNodeInstanceFromElement(
        e: Element | null,
    ): NodeInstance<ComponentInstance> | null;
}

export interface ISimulator<P = object> extends ISensor {
    readonly isSimulator: true;
}
