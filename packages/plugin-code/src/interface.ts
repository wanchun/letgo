export enum ResourceType {
    RESTQuery,
}

export interface FailureCondition {
    condition: string
    message: string
}

export interface QueryResource {
    id: string
    data?: any
    enableTransformer: boolean
    error?: any
    query: string
    queryFailureCondition: FailureCondition[]
    showFailureToaster: boolean

    showSuccessToaster: boolean
    successMessage: string

    runWhenModelUpdates: boolean
    runWhenPageLoads: boolean
    enableCaching?: boolean
    queryTimeout?: number
    transformer: string

}

export interface JavascriptQuery {

}

export interface JavascriptTransformer {
    id: string
    funcBody: string
}

export interface TemporaryState {
    id: string
    initValue: string
}

export interface Code {
    temporaryState: TemporaryState[]
}
