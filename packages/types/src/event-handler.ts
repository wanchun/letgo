export enum InnerEventHandlerAction {
    CONTROL_QUERY = 'controlQuery',
    CONTROL_COMPONENT = 'controlComponent',
    SET_TEMPORARY_STATE = 'setTemporaryState',
    SET_LOCAL_STORAGE = 'localStorage',
}

export interface IPublicTypeEventHandler {
    id: string
    action: string
    name: string
    namespace: string
    method: string
    onlyRunWhen?: string
    waitMs?: number
    waitType: string
    params?: {
        [key: string]: unknown
    }
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
    params: {
        value: string
        path?: string
    }
}

export interface ISetLocalStorageAction extends IPublicTypeEventHandler {
    namespace: InnerEventHandlerAction.SET_LOCAL_STORAGE
    action: InnerEventHandlerAction.SET_LOCAL_STORAGE
    method: string
    params: {
        key: string
        value: string
    }
}
