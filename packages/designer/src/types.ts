import { Component } from 'vue';
import { NodeSchema, PageSchema, ComponentSchema } from '@webank/letgo-types';
import { Node, NodeChildren } from './node';
import { DocumentModel } from './document';
import { ScrollTarget, LocateEvent, DropLocation } from './designer';
import { ISimulatorRenderer } from './simulator';

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

export function isDocumentModel(obj: any): obj is DocumentModel {
    return obj && obj.rootNode;
}

export interface NodeInstance<T = ComponentInstance> {
    docId: string;
    nodeId: string;
    instance: T;
    node?: Node | null;
}

export interface DropContainer {
    container: ParentalNode;
    instance: ComponentInstance;
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
}

export interface ISimulator<P = object> extends ISensor {
    readonly isSimulator: true;
    readonly viewport: IViewport;
    readonly contentWindow?: Window;
    readonly contentDocument?: Document;

    readonly renderer?: ISimulatorRenderer;

    setProps(props: P): void;

    /**
     * 设置拖拽态
     */
    setDraggingState(state: boolean): void;
    /**
     * 设置拷贝态
     */
    setCopyState(state: boolean): void;
    /**
     * 清除所有态：拖拽态、拷贝态
     */
    clearState(): void;

    /**
     * 在组件实例上寻找子组件实例
     */
    getClosestNodeInstance(
        from: ComponentInstance,
        specId?: string,
    ): NodeInstance | null;
    /**
     * 获取节点实例
     */
    getNodeInstanceFromElement(
        e: Element | null,
    ): NodeInstance<ComponentInstance> | null;
    /**
     * 根据节点获取节点的组件实例
     */
    getComponentInstances(node: Node): ComponentInstance[] | null;
    /**
     * 查找合适的投放容器
     */
    getDropContainer(e: LocateEvent): DropContainer | null;
}

export function isSimulator(obj: any): obj is ISimulator {
    return obj && obj.isSimulator;
}

export interface Point {
    clientX: number;
    clientY: number;
}

export type AutoFit = '100%';
// eslint-disable-next-line no-redeclare
export const AutoFit = '100%';

export interface IScrollable {
    scrollTarget?: ScrollTarget | Element;
    bounds?: DOMRect | null;
    scale?: number;
}

export interface IViewport extends IScrollable {
    /**
     * 视口大小
     */
    width: number;
    height: number;

    /**
     * 内容大小
     */
    contentWidth: number | AutoFit;
    contentHeight: number | AutoFit;

    /**
     * 内容缩放
     */
    scale: number;

    /**
     * 视口矩形维度
     */
    readonly bounds: DOMRect;
    /**
     * 内容矩形维度
     */
    readonly contentBounds: DOMRect;
    /**
     * 视口滚动对象
     */
    readonly scrollTarget?: ScrollTarget;
    /**
     * 是否滚动中
     */
    readonly scrolling: boolean;
    /**
     * 内容当前滚动 X
     */
    readonly scrollX: number;
    /**
     * 内容当前滚动 Y
     */
    readonly scrollY: number;

    /**
     * 全局坐标系转化为本地坐标系
     */
    toLocalPoint(point: Point): Point;

    /**
     * 本地坐标系转化为全局坐标系
     */
    toGlobalPoint(point: Point): Point;
}
