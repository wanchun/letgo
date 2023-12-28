import type { Component } from 'vue';
import type {
    IPublicModelNode,
    IPublicTypeComponentRecord,
    IPublicTypeDropContainer,
    IPublicTypeLocateEvent,
    IPublicTypeNodeInstance,
    IPublicTypeSensor,
    IPublicTypeSimulatorRenderer,
    IPublicTypeViewport,
} from '..';

export interface IPublicModelSimulator<P = object> extends IPublicTypeSensor {
    readonly isSimulator: true
    readonly viewport: IPublicTypeViewport
    readonly contentWindow?: Window
    readonly contentDocument?: Document

    readonly renderer?: IPublicTypeSimulatorRenderer

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
    ): IPublicTypeNodeInstance | null

    getComponentInstancesExpose(instance: IPublicTypeComponentRecord): Record<string, any>

    /**
     * 获取节点实例
     */
    getNodeInstanceFromElement(
        e: Element | null,
    ): IPublicTypeNodeInstance<IPublicTypeComponentRecord> | null
    /**
     * 根据节点获取节点的组件实例
     */
    getComponentInstances(node: IPublicModelNode): IPublicTypeComponentRecord[] | null
    /**
     * 查找合适的投放容器
     */
    getDropContainer(e: IPublicTypeLocateEvent): IPublicTypeDropContainer | null
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
    /**
     * 查找组件
     */
    getComponent(componentName: string): Component | null

    computeRect(node: IPublicModelNode): DOMRect | null
}

export function isSimulator(obj: any): obj is IPublicModelSimulator {
    return obj && obj.isSimulator;
}
