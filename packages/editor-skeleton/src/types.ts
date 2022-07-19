import { VNode, Ref, VNodeTypes } from 'vue';
import { Skeleton } from './skeleton';
import { Editor } from '@webank/letgo-editor-core';

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
    | 'leftFixedArea'
    | 'leftFloatArea';

export interface ContentArgument {
    config: IWidgetBaseConfig;
    editor: Editor;
}

export interface IWidgetBaseConfig {
    type: string;
    name: string;
    area: IWidgetConfigArea;
    props?: Record<string, any>;
    content: (arg: ContentArgument) => VNode | string;
    // index?: number;
    [extra: string]: any;
}

export interface WidgetProps {
    align?: 'left' | 'right' | 'bottom' | 'center' | 'top';
    onInit?: (widget: IWidget) => any;
    title?: string;
    onClick?: () => void;
}

export interface IWidgetConfig extends IWidgetBaseConfig {
    type: 'Widget';
    props?: WidgetProps;
}

export interface IDialogWidgetConfig extends IWidgetBaseConfig {
    type: 'DialogWidget';
    props?: WidgetProps;
    dialogProps?: {
        title?: string;
        [key: string]: any;
    };
}

export interface PanelProps {
    title?: string;
    description?: string;
    hideTitleBar?: boolean; // panel.props 兼容，不暴露
    width?: number; // panel.props
    height?: number; // panel.props
    maxWidth?: number; // panel.props
    maxHeight?: number; // panel.props
    condition?: (widget: IWidget) => any;
    onInit?: (widget: IWidget) => any;
    onDestroy?: () => any;
    shortcut?: string; // 只有在特定位置，可触发 toggle show
    enableDrag?: boolean; // 是否开启通过 drag 调整 宽度
    keepVisibleWhileDragging?: boolean; // 是否在该 panel 范围内拖拽时保持 visible 状态
}

export interface IPanelConfig extends IWidgetBaseConfig {
    type: 'Panel';
    props?: PanelProps;
}

export interface IPanelWidgetConfig extends IWidgetBaseConfig {
    type: 'PanelWidget';
    props?: WidgetProps;
    panelName: string;
    panelContent: () => VNode;
    panelProps?: PanelProps & {
        area?: IWidgetConfigArea;
    };
}

export interface IWidget {
    readonly name: string;
    readonly content: VNodeTypes;
    readonly align?: string;
    readonly isWidget: true;
    readonly visible: Ref<boolean>;
    readonly disabled?: Ref<boolean>;
    readonly body: VNodeTypes;
    readonly skeleton: Skeleton;
    readonly config: IWidgetBaseConfig;
    readonly onClick?: () => void;

    show(): void;
    hide(): void;
    toggle(): void;
    enable?(): void;
    disable?(): void;
}
