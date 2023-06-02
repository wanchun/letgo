export enum ComponentEventAction {
    CONTROL_QUERY = 'controlQuery',
    CONTROL_COMPONENT = 'controlComponent',
    GO_TO_URL = 'goToUrl',
    GO_TO_PAGE = 'goToPage',
    SET_TEMPORARY_STATE = 'setTemporaryState',
    SET_LOCAL_STORAGE = 'setLocalStorage',
}

export interface IComponentEventBase {
    id: string
    name: string
    onlyRunWhen?: string
    debounce?: number
}

export interface IControlQueryAction extends IComponentEventBase {
    action: ComponentEventAction.CONTROL_QUERY
    callId: string
    method: string
}

export interface IControlComponentAction extends IComponentEventBase {
    action: ComponentEventAction.CONTROL_COMPONENT
    callId: string
    method: string
    [key: string]: unknown
}

export interface IGoToUrlAction extends IComponentEventBase {
    action: ComponentEventAction.GO_TO_URL
    callId: 'utils'
    method: 'openUrl'
    url: string
    isOpenNewTab?: boolean
}

export interface IUrlParam {
    key: string
    value: string
}

export interface IGoToPageAction extends IComponentEventBase {
    action: ComponentEventAction.GO_TO_PAGE
    callId: 'utils'
    method: 'openPage'
    pageId: string
    queryParams: IUrlParam[]
    hashParams: IUrlParam[]
    isOpenNewTab?: boolean
}

export interface ISetTemporaryStateAction extends IComponentEventBase {
    action: ComponentEventAction.SET_TEMPORARY_STATE
    callId: string
    method: string
    value: string
    path?: string
}

export interface ISetLocalStorageAction extends IComponentEventBase {
    callId: 'localStorage'
    action: ComponentEventAction.SET_LOCAL_STORAGE
    method: string
    key: string
    value: string
}

export type IPublicTypeComponentEvent = IControlQueryAction | IControlComponentAction | IGoToUrlAction | IGoToPageAction | ISetTemporaryStateAction | ISetLocalStorageAction;
