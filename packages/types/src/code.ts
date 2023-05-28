export enum CodeType {
    JAVASCRIPT_QUERY = 'query',
    JAVASCRIPT_COMPUTED = 'computed',
    TEMPORARY_STATE = 'state',
}

export enum ResourceType {
    RESTQuery,
}

export interface FailureCondition {
    condition: string
    message: string
}

export enum RunCondition {
    MANUAL,
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
    type: CodeType.JAVASCRIPT_QUERY
}

export interface JavascriptComputed {
    id: string
    type: CodeType.JAVASCRIPT_COMPUTED
    funcBody: string
}

export interface TemporaryState {
    id: string
    type: CodeType.TEMPORARY_STATE
    initValue: string
}

export type CodeItem = TemporaryState | JavascriptComputed | JavascriptQuery;

export interface CodeDirectory {
    name: string
    code: CodeItem[]
}

export interface CodeStruct {
    directories: CodeDirectory[]
    code: CodeItem[]
}
