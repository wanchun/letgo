import type { IEventHandler } from './event-handler';

export enum IEnumCodeType {
    JAVASCRIPT_QUERY = 'query',
    JAVASCRIPT_FUNCTION = 'function',
    JAVASCRIPT_COMPUTED = 'computed',
    TEMPORARY_STATE = 'temporaryState',
}

export enum IEnumResourceType {
    Query = 'query',
    RESTQuery = 'rest',
}

export interface IFailureCondition {
    id: string
    condition: string
    message: string
}

export enum IEnumRunCondition {
    Manual = 'manual',
    // DependStateChange = 'dependStateChange',
}

export interface IQueryResourceBase {
    type: IEnumCodeType.JAVASCRIPT_QUERY
    id: string
    resourceType: IEnumResourceType
    enableTransformer?: boolean
    transformer?: string
    query: string
    queryFailureCondition?: IFailureCondition[]
    showFailureToaster?: boolean
    showSuccessToaster?: boolean
    successMessage?: string
    runCondition: IEnumRunCondition
    runWhenPageLoads?: boolean
    enableCaching?: boolean
    cacheDuration?: number
    queryTimeout?: number
    successEvent?: IEventHandler[]
    failureEvent?: IEventHandler[]
}

export interface IRestQueryResource extends IQueryResourceBase {
    resourceType: IEnumResourceType.RESTQuery
    method: string
    api: string
    params?: string
}

export type IJavascriptQuery = IQueryResourceBase | IRestQueryResource;

export function isRestQueryResource(obj: any): obj is IRestQueryResource {
    return obj && obj.resourceType === IEnumResourceType.RESTQuery;
}

export interface IJavascriptFunction {
    id: string
    type: IEnumCodeType.JAVASCRIPT_FUNCTION
    funcBody: string
}

export interface IJavascriptComputed {
    id: string
    type: IEnumCodeType.JAVASCRIPT_COMPUTED
    funcBody: string
}

export interface ITemporaryState {
    id: string
    type: IEnumCodeType.TEMPORARY_STATE
    initValue: string
}

export type ICodeItem = ITemporaryState | IJavascriptComputed | IJavascriptFunction | IJavascriptQuery;

export interface ICodeDirectory {
    name: string
    code: ICodeItem[]
}

export interface ICodeStruct {
    directories: ICodeDirectory[]
    code: ICodeItem[]
}
