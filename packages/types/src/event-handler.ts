export enum EventHandlerAction {
    CONTROL_QUERY = 'controlQuery',
    CONTROL_COMPONENT = 'controlComponent',
    GO_TO_URL = 'goToUrl',
    GO_TO_PAGE = 'goToPage',
    SET_TEMPORARY_STATE = 'setTemporaryState',
    SET_LOCAL_STORAGE = 'setLocalStorage',
}

export interface IEventHandlerBase {
    id: string
    name: string
    onlyRunWhen?: string
    waitMs?: number
    waitType: string
}

export interface IControlQueryAction extends IEventHandlerBase {
    action: EventHandlerAction.CONTROL_QUERY
    callId: string
    method: string
}

export interface IControlComponentAction extends IEventHandlerBase {
    action: EventHandlerAction.CONTROL_COMPONENT
    callId: string
    method: string
    [key: string]: unknown
}

export interface IGoToUrlAction extends IEventHandlerBase {
    action: EventHandlerAction.GO_TO_URL
    callId: 'utils'
    method: 'openUrl'
    url: string
    isOpenNewTab?: boolean
}

export interface IUrlParam {
    key: string
    value: string
}

export interface IGoToPageAction extends IEventHandlerBase {
    action: EventHandlerAction.GO_TO_PAGE
    callId: 'utils'
    method: 'openPage'
    pageId: string
    queryParams: IUrlParam[]
    hashParams: IUrlParam[]
    isOpenNewTab?: boolean
}

export interface ISetTemporaryStateAction extends IEventHandlerBase {
    action: EventHandlerAction.SET_TEMPORARY_STATE
    callId: string
    method: string
    value: string
    path?: string
}

export interface ISetLocalStorageAction extends IEventHandlerBase {
    callId: 'localStorage'
    action: EventHandlerAction.SET_LOCAL_STORAGE
    method: string
    key: string
    value: string
}

export type IPublicTypeEventHandler = IControlQueryAction | IControlComponentAction | IGoToUrlAction | IGoToPageAction | ISetTemporaryStateAction | ISetLocalStorageAction;
