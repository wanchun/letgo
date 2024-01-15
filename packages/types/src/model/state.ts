import type { IPublicTypeComponentRecord } from '..';

export interface IPublicModelState {
    componentsInstance: Record<string, any>

    codesInstance: Record<string, any>

    hasStateId(id: string): any

    triggerAfterSimulatorReady(fn: () => void): void

    getInstances(instances: IPublicTypeComponentRecord[]): Record<string, any>[]

    getCompScope(ref: string): Record<string, any>

    changeNodeRef(ref: string, preRef: string): void

}
