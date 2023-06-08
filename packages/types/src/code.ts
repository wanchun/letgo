import type { IPublicTypeEventHandler } from './event-handler';

export enum CodeType {
    JAVASCRIPT_QUERY = 'query',
    JAVASCRIPT_COMPUTED = 'computed',
    TEMPORARY_STATE = 'state',
}

export enum ResourceType {
    RESTQuery,
}

export interface IFailureCondition {
    id: string
    condition: string
    message: string
}

export enum RunCondition {
    MANUAL,
    PageLoads,
}

export interface IQueryResource {
    id: string
    enableTransformer: boolean
    query: string
    queryFailureCondition: IFailureCondition[]
    showFailureToaster: boolean
    showSuccessToaster: boolean
    successMessage: string
    runCondition?: RunCondition
    enableCaching?: boolean
    queryTimeout?: number
    transformer: string
    successEvent?: IPublicTypeEventHandler[]
    failureEvent?: IPublicTypeEventHandler[]
}
export interface IJavascriptQuery extends IQueryResource {
    type: CodeType.JAVASCRIPT_QUERY
}

export interface IJavascriptComputed {
    id: string
    type: CodeType.JAVASCRIPT_COMPUTED
    funcBody: string
}

export interface ITemporaryState {
    id: string
    type: CodeType.TEMPORARY_STATE
    initValue: string
}

export type CodeItem = ITemporaryState | IJavascriptComputed | IJavascriptQuery;

export interface CodeDirectory {
    name: string
    code: CodeItem[]
}

export interface CodeStruct {
    directories: CodeDirectory[]
    code: CodeItem[]
}
