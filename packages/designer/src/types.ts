import type {
    IPublicTypeAutoFit,
    IPublicTypeComponentRecord,
    IPublicTypePoint,
} from '@webank/letgo-types';
import type { Component } from 'vue';
import type { DocumentModel } from './document';
import type { DropLocation, ILocateEvent, ScrollTarget } from './designer';
import type { ISimulatorRenderer } from './simulator';
import type { INode } from './node';

export type { INode, IPageNode, IComponentNode, ISlotNode, IRootNode } from './node';

export function isDocumentModel(obj: any): obj is DocumentModel {
    return obj && obj.rootNode;
}

export interface INodeInstance<T = IPublicTypeComponentRecord> {
    docId: string
    nodeId: string
    instance: T
    node?: INode | null
}

export interface IDropContainer {
    container: INode
    instance: IPublicTypeComponentRecord
}

export interface INodeSelector {
    node: INode
    instance?: IPublicTypeComponentRecord
}

export interface ISensor {
    /**
     * 是否可响应，比如面板被隐藏，可设置该值 false
     */
    readonly sensorAvailable: boolean
    /**
     * 给事件打补丁
     */
    fixEvent(e: ILocateEvent): ILocateEvent
    /**
     * 定位并激活
     */
    locate(e: ILocateEvent): DropLocation | undefined | null
    /**
     * 是否进入敏感板区域
     */
    isEnter(e: ILocateEvent): boolean
    /**
     * 取消激活
     */
    deActiveSensor(): void
}

export interface ISimulator<P = object> extends ISensor {
    readonly isSimulator: true
    readonly viewport: IViewport
    readonly contentWindow?: Window
    readonly contentDocument?: Document

    readonly renderer?: ISimulatorRenderer

    setProps(props: P): void

    onEvent(eventName: string, callback: (...args: any[]) => void): () => void

    /**
     * 设置拖拽态
     */
    setDraggingState(state: boolean): void
    /**
     * 设置拷贝态
     */
    setCopyState(state: boolean): void
    /**
     * 清除所有态：拖拽态、拷贝态
     */
    clearState(): void

    onUpdateCodesInstance(func: (codesInstance: Record<string, any>) => void): () => void

    /**
     * 缓存节点id的实例
     */
    setInstance(
        docId: string,
        id: string,
        instances: IPublicTypeComponentRecord[] | null,
    ): void

    /**
     * 在组件实例上寻找子组件实例
     */
    getClosestNodeInstance(
        from: IPublicTypeComponentRecord,
        specId?: string,
    ): INodeInstance | null

    getComponentInstancesExpose(instance: IPublicTypeComponentRecord): Record<string, any>

    /**
     * 获取节点实例
     */
    getNodeInstanceFromElement(
        e: Element | null,
    ): INodeInstance<IPublicTypeComponentRecord> | null
    /**
     * 根据节点获取节点的组件实例
     */
    getComponentInstances(node: INode): IPublicTypeComponentRecord[] | null
    /**
     * 查找合适的投放容器
     */
    getDropContainer(e: ILocateEvent): IDropContainer | null
    /**
     * 查找节点的 dom
     */
    findDOMNodes(
        instance: IPublicTypeComponentRecord,
        selector?: string,
    ): Array<Element | Text> | null
    /**
     * 计算节点位置
     */
    computeComponentInstanceRect(
        instance: IPublicTypeComponentRecord,
        selector?: string,
    ): DOMRect | null
    // /**
    //  * 生成组件schema
    //  */
    // generateComponentMetadata(componentName: string): IPublicTypeComponentMetadata
    /**
     * 查找组件
     */
    getComponent(componentName: string): Component | null

    computeRect(node: INode): DOMRect | null
}

export function isSimulator(obj: any): obj is ISimulator {
    return obj && obj.isSimulator;
}

export const AutoFit = '100%';

export interface IScrollable {
    scrollTarget?: ScrollTarget | Element
    bounds?: DOMRect | null
    scale?: number
}

export interface IViewport extends IScrollable {
    /**
     * 视口大小
     */
    width: number
    height: number

    /**
     * 内容大小
     */
    contentWidth: number | IPublicTypeAutoFit
    contentHeight: number | IPublicTypeAutoFit

    /**
     * 内容缩放
     */
    scale: number

    /**
     * 视口矩形维度
     */
    readonly bounds: DOMRect
    /**
     * 内容矩形维度
     */
    readonly contentBounds: DOMRect
    /**
     * 视口滚动对象
     */
    readonly scrollTarget?: ScrollTarget
    /**
     * 是否滚动中
     */
    readonly scrolling: boolean
    /**
     * 内容当前滚动 X
     */
    readonly scrollX: number
    /**
     * 内容当前滚动 Y
     */
    readonly scrollY: number

    /**
     * 全局坐标系转化为本地坐标系
     */
    toLocalPoint(point: IPublicTypePoint): IPublicTypePoint

    /**
     * 本地坐标系转化为全局坐标系
     */
    toGlobalPoint(point: IPublicTypePoint): IPublicTypePoint
}
