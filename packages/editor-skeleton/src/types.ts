import { VNode, Ref, VNodeTypes } from 'vue';
import { Skeleton } from './skeleton';
import { Editor } from '@webank/letgo-editor-core';
import { Modal, Panel } from './widget';

/**
 * 所有可能的停靠位置
 */
export type IWidgetConfigArea =
    | 'leftArea'
    | 'left'
    | 'rightArea'
    | 'right'
    | 'topArea'
    | 'top'
    | 'toolbar'
    | 'mainArea'
    | 'main'
    | 'center'
    | 'centerArea'
    | 'bottomArea'
    | 'bottom'
    | 'leftFloatArea'
    | 'global'
    | 'globalArea';

export interface IContentArgument {
    config: IWidgetBaseConfig;
    editor: Editor;
}

export interface IWidgetBaseConfig {
    type: string;
    name: string;
    area: IWidgetConfigArea;
    props?: Record<string, any>;
    content: (arg: IContentArgument) => VNode | string;
    // index?: number;
    [extra: string]: any;
}

export interface IWidgetProps {
    align?: 'left' | 'right' | 'bottom' | 'center' | 'top';
    title?: string;
    onInit?: (widget: IWidget) => any;
    onClick?: (widget: IWidget) => any;
}

export interface IWidgetConfig extends IWidgetBaseConfig {
    type: 'Widget';
    props?: IWidgetProps;
}

export interface IModalProps {
    title?: string;
    closable?: boolean;
    mask?: boolean;
    maskClosable?: boolean;
    footer?: boolean;
    okText?: string;
    cancelText?: string;
    width?: string | number;
    top?: string | number;
    verticalCenter?: boolean;
    center?: boolean;
    fullScreen?: boolean;
    contentClass?: string;
    getContainer?: () => HTMLElement;
    onOk?: (widget: IWidget) => any;
    onCancel?: (widget: IWidget) => any;
}

export interface IModalConfig extends IWidgetBaseConfig {
    type: 'Modal';
    props?: IModalProps;
}

export function isModalConfig(obj: any): obj is IModalConfig {
    return obj && obj.type === 'Modal';
}

export interface IWidgetModalConfig extends IWidgetBaseConfig {
    type: 'WidgetModal';
    props?: IWidgetProps;
    modalName?: string;
    modalContent: (arg: IContentArgument) => VNode | string;
    modalProps?: IModalProps;
}

export function isWidgetModalConfig(obj: any): obj is IWidgetModalConfig {
    return obj && obj.type === 'WidgetModal';
}

export interface IPanelProps {
    title?: string;
    description?: string;
    width?: number; // panel.props
    height?: number; // panel.props
    maxWidth?: number; // panel.props
    maxHeight?: number; // panel.props
}

export interface IPanelConfig extends IWidgetBaseConfig {
    type: 'Panel';
    props?: IPanelProps;
}

export function isPanelConfig(obj: any): obj is IPanelConfig {
    return obj && obj.type === 'Panel';
}

export interface IWidgetPanelConfig extends IWidgetBaseConfig {
    type: 'WidgetPanel';
    props?: IWidgetProps;
    panelName?: string;
    panelContent: () => VNode | string;
    panelProps?: IPanelProps & {
        area?: IWidgetConfigArea;
    };
}

export function isWidgetPanelConfig(obj: any): obj is IWidgetPanelConfig {
    return obj && obj.type === 'WidgetPanel';
}

export interface IWidget {
    readonly name: string;
    readonly content: VNodeTypes;
    readonly isWidget: true;
    readonly visible: Ref<boolean>;
    readonly disabled?: Ref<boolean>;
    readonly body: VNodeTypes;
    readonly skeleton: Skeleton;
    readonly config: IWidgetBaseConfig;

    show(): void;
    hide(): void;
    toggle(): void;
    enable?(): void;
    disable?(): void;
}

export function isWidget(obj: any): obj is IWidget {
    return obj && obj.isWidget;
}

export function isModal(obj: any): obj is Modal {
    return obj && obj.isModal;
}

export function isPanel(obj: any): obj is Panel {
    return obj && obj.isPanel;
}

export enum SkeletonEvents {
    WIDGET_SHOW = 'skeleton.widget.show',
    WIDGET_HIDE = 'skeleton.widget.hide',
    WIDGET_DISABLE = 'skeleton.widget.disable',
    WIDGET_ENABLE = 'skeleton.widget.enable',
}
