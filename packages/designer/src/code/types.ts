import type { IEnumCodeType } from '@webank/letgo-types';

export interface ICodeBaseImpl {
    id: string
    get view(): Record<string, any>
    changeId(id: string): void
    changeContent(content: Record<string, any>): void
}

export interface ITemporaryStateImpl extends ICodeBaseImpl {
    type: IEnumCodeType.TEMPORARY_STATE
    changeDeps(deps: string[]): void
}

export interface IJavascriptComputedImpl extends ICodeBaseImpl {
    type: IEnumCodeType.JAVASCRIPT_COMPUTED
    changeDeps(deps: string[]): void
}

export interface IJavascriptQueryImpl extends ICodeBaseImpl {
    type: IEnumCodeType.JAVASCRIPT_QUERY
    trigger(): void
}

export interface IJavascriptFunctionImpl extends ICodeBaseImpl {
    type: IEnumCodeType.JAVASCRIPT_FUNCTION
    trigger(): void
}

export type CodeImplType = ITemporaryStateImpl | IJavascriptComputedImpl | IJavascriptQueryImpl | IJavascriptFunctionImpl;
