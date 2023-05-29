import type { CodeType } from '@webank/letgo-types';

export interface ITemporaryStateImpl {
    id: string
    type: CodeType.TEMPORARY_STATE
    changeDeps(deps: string[]): void
    changeId(id: string): void
    get view(): Record<string, any>
}
