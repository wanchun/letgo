import type { Component } from 'vue';
import type {
    IPublicTypeComponentRecord,
    IPublicTypeNodeInstance,
    IPublicTypeNodeSchema,
} from '..';

export interface IPublicTypeSimulatorRenderer {
    readonly isSimulatorRenderer: true
    createComponent(schema: IPublicTypeNodeSchema): Component | null
    getComponent(componentName: string): Component | null
    getNodeInstanceExpose(instance: IPublicTypeComponentRecord): Record<string, any>
    getClosestNodeInstance(
        from: IPublicTypeComponentRecord | Element,
        nodeId?: string,
    ): IPublicTypeNodeInstance<IPublicTypeComponentRecord> | null
    findDOMNodes(
        instance: IPublicTypeComponentRecord,
    ): Array<Element | Text> | null
    getClientRects(element: Element | Text): DOMRect[]
    setNativeSelection(enableFlag: boolean): void
    setDraggingState(state: boolean): void
    setCopyState(state: boolean): void
    clearState(): void
    run(): void
    loadAsyncLibrary: (library: { [key: string]: object }) => void
}

export function isSimulatorRenderer(obj: any): obj is IPublicTypeSimulatorRenderer {
    return obj && obj.isSimulatorRenderer;
}
