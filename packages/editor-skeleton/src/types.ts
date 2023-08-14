import type { VNodeChild } from 'vue';
import type { IPublicEditor } from '@harrywan/letgo-types';
import type { Area } from './area';
import type { Skeleton } from './skeleton';

export enum IEnumSkeletonEvent {
    WIDGET_SHOW = 'skeleton.widget.show',
    WIDGET_HIDE = 'skeleton.widget.hide',
    WIDGET_DISABLE = 'skeleton.widget.disable',
    WIDGET_ENABLE = 'skeleton.widget.enable',
}

/**
 * 所有可能的停靠位置
 */
export type IAreaPosition =
    | 'leftArea'
    | 'rightArea'
    | 'topArea'
    | 'toolbarArea'
    | 'mainArea'
    | 'bottomArea'
    | 'leftFloatArea'
    | 'globalArea';

export interface IRenderOption {
    widget: IBaseWidget
    config: IBaseConfig
    editor: IPublicEditor
}

export interface IWidgetProps {
    title?: string
    align?: 'left' | 'right' | 'bottom' | 'center' | 'top'
    onInit?: (widget: IWidget) => any
    onClick?: (widget: IWidget) => any
}

export interface IModalProps {
    title?: string
    closable?: boolean
    mask?: boolean
    maskClosable?: boolean
    footer?: boolean
    okText?: string
    cancelText?: string
    width?: string | number
    top?: string | number
    verticalCenter?: boolean
    center?: boolean
    fullScreen?: boolean
    contentClass?: string
    getContainer?: () => HTMLElement
    onOk?: (widget: IModal) => any
    onCancel?: (widget: IModal) => any
}

export interface IPanelProps {
    title?: string
    description?: string
    width?: number | string
    height?: number | string
    maxWidth?: number | string
    maxHeight?: number | string
}

export interface IBaseConfig {
    type: string
    name: string
    area: IAreaPosition
    props?: Record<string, any>
    render: (option: IRenderOption) => VNodeChild
    [extra: string]: any
}

export interface IWidgetConfig extends IBaseConfig {
    type: 'Widget'
    props?: IWidgetProps
}

export interface IModalConfig extends IBaseConfig {
    type: 'Modal'
    props?: IModalProps
}

export interface IPanelConfig extends IBaseConfig {
    type: 'Panel'
    props?: IPanelProps
}

export type IUnionConfig = IWidgetConfig | IModalConfig | IPanelConfig;

export function isWidgetConfig(obj: any): obj is IWidgetConfig {
    return obj && obj.type === 'Widget';
}

export function isModalConfig(obj: any): obj is IModalConfig {
    return obj && obj.type === 'Modal';
}

export function isPanelConfig(obj: any): obj is IPanelConfig {
    return obj && obj.type === 'Panel';
}

export interface IBaseWidget {
    /**
     * 名称
     */
    readonly name: string
    /**
     * 是否可见
     */
    readonly visible: boolean
    /**
     * 是否禁用
     */
    readonly disabled: boolean
    /**
     * skeleton
     */
    readonly skeleton: Skeleton
    /**
     * 配置
     */
    readonly config: IBaseConfig
    /**
     * 用户自定义render函数执行结果
     */
    readonly body: VNodeChild

    show(): void
    hide(): void
    toggle(): void
    enable?(): void
    disable?(): void
}

export interface IWidget extends IBaseWidget {
    /**
     * 对应组件
     */
    readonly content: VNodeChild
    readonly isWidget: true

    readonly align?: string
    readonly title: string
    readonly linked?: IModal | IPanel
    readonly onClick?: (widget: IWidget) => void
    readonly onInit?: (widget: IWidget) => void

}

export interface IModal extends IBaseWidget {
    /**
     * 对应组件
     */
    readonly content: VNodeChild
    readonly isModal: true
    readonly props: IModalProps
}

export interface IPanel extends IBaseWidget {
    /**
     * 对应组件
     */
    readonly content: VNodeChild
    readonly isPanel: true
    readonly props: IPanelProps

    parent: Area<any, any>
    setParent: (parent: Area<any, any>) => void
}

export interface IWidgetModel extends IWidget {
    readonly modal: IModal
}

export interface IWidgetPanel extends IWidget {
    readonly panel: IPanel
}

export function isWidget(obj: any): obj is IWidget {
    return obj && obj.isWidget;
}

export function isModal(obj: any): obj is IModal {
    return obj && obj.isModal;
}

export function isPanel(obj: any): obj is IPanel {
    return obj && obj.isPanel;
}
