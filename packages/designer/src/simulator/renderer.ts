import type { Component } from 'vue';
import type { IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { IComponentInstance, INodeInstance } from '../types';

export interface ISimulatorRenderer {
    readonly isSimulatorRenderer: true
    createComponent(schema: IPublicTypeNodeSchema): Component | null
    getComponent(componentName: string): Component
    getClosestNodeInstance(
        from: IComponentInstance,
        nodeId?: string,
    ): INodeInstance<IComponentInstance> | null
    findDOMNodes(
        instance: IComponentInstance,
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
