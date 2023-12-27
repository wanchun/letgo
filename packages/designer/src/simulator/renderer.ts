import type { Component } from 'vue';
import type { IPublicTypeComponentRecord, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { INodeInstance } from '../types';

export interface ISimulatorRenderer {
    readonly isSimulatorRenderer: true
    createComponent(schema: IPublicTypeNodeSchema): Component | null
    getComponent(componentName: string): Component | null
    getNodeInstanceExpose(instance: IPublicTypeComponentRecord): Record<string, any>
    getClosestNodeInstance(
        from: IPublicTypeComponentRecord | Element,
        nodeId?: string,
    ): INodeInstance<IPublicTypeComponentRecord> | null
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

export function isSimulatorRenderer(obj: any): obj is ISimulatorRenderer {
    return obj && obj.isSimulatorRenderer;
}
