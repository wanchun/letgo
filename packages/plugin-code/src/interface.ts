export enum ResourceType {
    RESTQuery,
}

export interface FailureCondition {
    condition: string
    message: string
}

export interface QueryResource {
    id: string
    enableTransformer: boolean
    query: string
    queryFailureCondition: FailureCondition[]
    showSuccessToaster: boolean
    successMessage: string
    runWhenModelUpdates: boolean
    runWhenPageLoads: boolean
    enableCaching?: boolean
    queryTimeout?: number
    transformer: string
}

export interface JavascriptQuery extends QueryResource {

}

export interface JavascriptComputed {
    id: string
    funcBody: string
}

export interface TemporaryState {
    id: string
    type: 'temporaryState'
    initValue: string
}

export type CodeItem = TemporaryState | JavascriptComputed | JavascriptQuery;

interface DirectoryItem {
    name: string
    code: CodeItem[]
}

export interface Code {
    directory: DirectoryItem[]
    code: CodeItem[]
}
