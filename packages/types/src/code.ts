import type { IPublicTypeEventHandler } from './event-handler';

export enum CodeType {
    JAVASCRIPT_QUERY = 'query',
    JAVASCRIPT_FUNCTION = 'function',
    JAVASCRIPT_COMPUTED = 'computed',
    TEMPORARY_STATE = 'state',
}

export enum ResourceType {
    Query = 'query',
    RESTQuery = 'rest',
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

export interface QueryResourceBase {
    type: CodeType.JAVASCRIPT_QUERY
    id: string
    resourceType: ResourceType
    query: string
    queryFailureCondition: IFailureCondition[]
    showFailureToaster: boolean
    showSuccessToaster: boolean
    successMessage: string
    runCondition?: RunCondition
    runWhenPageLoads?: boolean
    enableCaching?: boolean
    cacheDuration?: number
    queryTimeout?: number
    successEvent?: IPublicTypeEventHandler[]
    failureEvent?: IPublicTypeEventHandler[]
}

export interface IRestQueryResource extends QueryResourceBase {
    resourceType: ResourceType.RESTQuery
    method: string
    api: string
    params?: string
    enableTransformer?: boolean
    transformer?: string
}

export type IJavascriptQuery = QueryResourceBase | IRestQueryResource;

export function isRestQueryResource(obj: any): obj is IRestQueryResource {
    return obj && obj.resourceType === ResourceType.RESTQuery;
}

export interface IJavascriptFunction {
    id: string
    type: CodeType.JAVASCRIPT_FUNCTION
    funcBody: string
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

export type CodeItem = ITemporaryState | IJavascriptComputed | IJavascriptFunction | IJavascriptQuery;

export interface CodeDirectory {
    name: string
    code: CodeItem[]
}

export interface CodeStruct {
    directories: CodeDirectory[]
    code: CodeItem[]
}
