import type { IEventHandler } from './event-handler';
import type { IPublicTypeJSExpression } from '.';

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
    id: string;
    condition: string;
    message: string;
}

export enum IEnumRunCondition {
    Manual = 'manual',
    // DependStateChange = 'dependStateChange',
}

interface ILogicBase {
    key: string;
    id: string;
    type: IEnumCodeType;
}

export interface IQueryResourceBase extends ILogicBase {
    type: IEnumCodeType.JAVASCRIPT_QUERY;
    resourceType: IEnumResourceType;
    enableTransformer?: boolean;
    transformer?: string;
    query: string;
    queryFailureCondition?: IFailureCondition[];
    showFailureToaster?: boolean;
    showSuccessToaster?: boolean;
    successMessage?: string;
    runCondition: IEnumRunCondition;
    runWhenPageLoads?: boolean;
    enableCaching?: boolean;
    cacheDuration?: number;
    queryTimeout?: number;
    successEvent?: IEventHandler[];
    failureEvent?: IEventHandler[];
}

export interface IRestQueryResource extends IQueryResourceBase {
    resourceType: IEnumResourceType.RESTQuery;
    method: string;
    headers?: IPublicTypeJSExpression;
    api: string;
    params?: string;
}

export type IJavascriptQuery = IQueryResourceBase | IRestQueryResource;

export function isQueryResource(obj: any): obj is IJavascriptQuery {
    return obj && obj.type === IEnumCodeType.JAVASCRIPT_QUERY;
}

export function isRestQueryResource(obj: any): obj is IRestQueryResource {
    return obj && obj.resourceType === IEnumResourceType.RESTQuery;
}

export interface IJavascriptFunction extends ILogicBase {
    type: IEnumCodeType.JAVASCRIPT_FUNCTION;
    funcBody: string;
}

export function isJavascriptFunction(obj: any): obj is IJavascriptFunction {
    return obj && obj.type === IEnumCodeType.JAVASCRIPT_FUNCTION;
}

export interface IJavascriptComputed extends ILogicBase {
    type: IEnumCodeType.JAVASCRIPT_COMPUTED;
    funcBody: string;
}

export function isJavascriptComputed(obj: any): obj is IJavascriptComputed {
    return obj && obj.type === IEnumCodeType.JAVASCRIPT_COMPUTED;
}

export interface ITemporaryState extends ILogicBase {
    type: IEnumCodeType.TEMPORARY_STATE;
    initValue: string;
}

export function isVariableState(obj: any): obj is ITemporaryState {
    return obj && obj.type === IEnumCodeType.TEMPORARY_STATE;
}

export type ICodeItem = ITemporaryState | IJavascriptComputed | IJavascriptFunction | IJavascriptQuery;

export interface ICodeDirectory {
    id: string;
    code: ICodeItem[];
}

export function isDirectory(obj: any): obj is ICodeDirectory {
    return obj && obj.code;
}

export interface ICodeStruct {
    directories: ICodeDirectory[];
    code: ICodeItem[];
}

export type ICodeItemOrDirectory = ICodeItem | ICodeDirectory;
