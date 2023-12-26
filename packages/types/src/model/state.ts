import type { IPublicTypeComponentInstance } from '..';

export interface IPublicModelState {
    componentsInstance: Record<string, any>

    codesInstance: Record<string, any>

    hasStateId(id: string): any

    triggerAfterSimulatorReady(fn: () => void): void

    getInstance(instances: IPublicTypeComponentInstance[]): Record<string, any>

    changeNodeRef(ref: string, preRef: string): void

}
