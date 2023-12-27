import type { IPublicTypeComponentRecord } from '..';

export interface IPublicModelState {
    componentsInstance: Record<string, any>

    codesInstance: Record<string, any>

    hasStateId(id: string): any

    triggerAfterSimulatorReady(fn: () => void): void

    getInstance(instances: IPublicTypeComponentRecord[]): Record<string, any>

    changeNodeRef(ref: string, preRef: string): void

}
