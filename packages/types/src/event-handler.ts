export enum InnerEventHandlerAction {
    CONTROL_QUERY = 'controlQuery',
    CONTROL_COMPONENT = 'controlComponent',
    SET_TEMPORARY_STATE = 'setTemporaryState',
    SET_LOCAL_STORAGE = 'localStorage',
    RUN_FUNCTION = 'runFunction',
}

export interface IPublicTypeEventHandler {
    id: string
    action: InnerEventHandlerAction
    name: string
    namespace: string
    method?: string
    onlyRunWhen?: string
    waitMs?: number
    waitType: string
    params?: string[]
}

export interface IEventHandlerMetaParam {
    field: string
    type: string
    children?: IEventHandlerMetaParam[]
}

export interface IEventHandlerMeta {
    action: {
        value: string
        label: string
    }
    namespace: string
    method: string
    params: IEventHandlerMetaParam[]
}

export interface IControlQueryAction extends IPublicTypeEventHandler {
    action: InnerEventHandlerAction.CONTROL_QUERY
    namespace: string
    method: string
}

export interface IControlComponentAction extends IPublicTypeEventHandler {
    action: InnerEventHandlerAction.CONTROL_COMPONENT
    namespace: string
    method: string
}

export interface ISetTemporaryStateAction extends IPublicTypeEventHandler {
    action: InnerEventHandlerAction.SET_TEMPORARY_STATE
    namespace: string
    method: string
    params: [string, string]
}

export interface ISetLocalStorageAction extends IPublicTypeEventHandler {
    namespace: InnerEventHandlerAction.SET_LOCAL_STORAGE
    action: InnerEventHandlerAction.SET_LOCAL_STORAGE
    method: string
    params: [string, string]
}

export interface IRunFunctionAction extends IPublicTypeEventHandler {
    action: InnerEventHandlerAction.RUN_FUNCTION
    namespace: string
    params: string[]
}

export function isRunFunctionEventHandler(data: IPublicTypeEventHandler): data is IRunFunctionAction {
    return data.action === InnerEventHandlerAction.RUN_FUNCTION;
}

export function isSetTemporaryStateEventHandler(data: IPublicTypeEventHandler): data is ISetTemporaryStateAction {
    return data.action === InnerEventHandlerAction.SET_TEMPORARY_STATE;
}

export function isSetLocalStorageEventHandler(data: IPublicTypeEventHandler): data is ISetLocalStorageAction {
    return data.action === InnerEventHandlerAction.SET_LOCAL_STORAGE;
}
