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
    initValue: string
}

type CodeType = TemporaryState | JavascriptComputed | JavascriptQuery;

interface DirectoryItem {
    name: string
    codes: CodeType[]
}

export interface CodeStruct {
    directory: DirectoryItem[]
    codes: CodeType[]
}
