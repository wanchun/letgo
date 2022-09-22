import { Component } from 'vue';
import { ComponentInstance, NodeInstance } from '../types';
import { NodeSchema } from '@webank/letgo-types';

export interface ISimulatorRenderer {
    readonly isSimulatorRenderer: true;
    createComponent(schema: NodeSchema): Component | null;
    getComponent(componentName: string): Component;
    getClosestNodeInstance(
        from: ComponentInstance,
        nodeId?: string,
    ): NodeInstance<ComponentInstance> | null;
    findDOMNodes(instance: ComponentInstance): Array<Element | Text> | null;
    getClientRects(element: Element | Text): DOMRect[];
    setNativeSelection(enableFlag: boolean): void;
    setDraggingState(state: boolean): void;
    setCopyState(state: boolean): void;
    clearState(): void;
    run(): void;
    loadAsyncLibrary: (library: { [key: string]: object }) => void;
}

export function isSimulatorRenderer(obj: any): obj is ISimulatorRenderer {
    return obj && obj.isSimulatorRenderer;
}
