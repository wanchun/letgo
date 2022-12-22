import { Component } from 'vue';
import { NodeSchema } from '@webank/letgo-types';
import { NodeInstance, InnerComponentInstance } from '../types';

export interface ISimulatorRenderer {
    readonly isSimulatorRenderer: true;
    createComponent(schema: NodeSchema): Component | null;
    getComponent(componentName: string): Component;
    getClosestNodeInstance(
        from: InnerComponentInstance,
        nodeId?: string,
    ): NodeInstance<InnerComponentInstance> | null;
    findDOMNodes(
        instance: InnerComponentInstance,
    ): Array<Element | Text> | null;
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
