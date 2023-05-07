import type { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from './constants';

export enum ResourceType {
    RESTQuery,
}

export interface FailureCondition {
    condition: string
    message: string
}

export enum RunCondition {
    ModelUpdate,
    PageLoads,
}

export interface QueryResource {
    id: string
    enableTransformer: boolean
    query: string
    queryFailureCondition: FailureCondition[]
    showSuccessToaster: boolean
    successMessage: string
    runCondition?: RunCondition
    enableCaching?: boolean
    queryTimeout?: number
    transformer: string
}
export interface JavascriptQuery extends QueryResource {
    type: typeof JAVASCRIPT_QUERY
}

export interface JavascriptComputed {
    id: string
    type: typeof JAVASCRIPT_COMPUTED
    funcBody: string
}

export interface TemporaryState {
    id: string
    type: typeof TEMPORARY_STATE
    initValue: string
}

export type CodeType = typeof JAVASCRIPT_COMPUTED | typeof JAVASCRIPT_QUERY | typeof TEMPORARY_STATE;

export type CodeItem = TemporaryState | JavascriptComputed | JavascriptQuery;

interface Directory {
    name: string
    code: CodeItem[]
}

export interface CodeStruct {
    directories: Directory[]
    code: CodeItem[]
}

export interface CodeInject {
    hasCodeId: (id: string) => boolean
}
