import type { VNodeChild } from 'vue';
import type { IPublicEditor } from '@webank/letgo-types';
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
    | 'leftFloatArea';

export interface IRenderOption {
    widget: IBaseWidget;
    config: IBaseConfig;
    editor: IPublicEditor;
}

export interface IWidgetProps {
    title?: string;
    align?: 'left' | 'right' | 'bottom' | 'center' | 'top';
    onInit?: (widget: IWidget) => any;
    onClick?: (widget: IWidget) => any;
}

export interface IPanelProps {
    title?: string;
    description?: string;
    width?: number | string;
    height?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    displayDirective?: 'if' | 'show' | 'lazyShow';
}

export interface ITabPanelProps {
    title?: string;
    align?: 'left' | 'right';
    height?: number;
    displayDirective?: 'if' | 'show' | 'lazyShow';
}

export interface IBaseConfig {
    type: string;
    name: string;
    area: IAreaPosition;
    props?: Record<string, any>;
    render: (option: IRenderOption) => VNodeChild;
    [extra: string]: any;
}

export interface IWidgetConfig extends IBaseConfig {
    type: 'Widget';
    props?: IWidgetProps;
}

export interface IPanelConfig extends IBaseConfig {
    type: 'Panel';
    props?: IPanelProps;
    defaultFixed?: boolean;
}

export interface ITabPanelConfig extends IBaseConfig {
    type: 'TabPanel';
    renderHeader: (option: IRenderOption) => VNodeChild;
    props?: ITabPanelProps;
}

export type IUnionConfig = IWidgetConfig | IPanelConfig | ITabPanelConfig;

export function isWidgetConfig(obj: any): obj is IWidgetConfig {
    return obj && obj.type === 'Widget';
}

export function isPanelConfig(obj: any): obj is IPanelConfig {
    return obj && obj.type === 'Panel';
}

export function isTabPanelConfig(obj: any): obj is ITabPanelConfig {
    return obj && obj.type === 'TabPanel';
}

export interface IBaseWidget {
    /**
     * 名称
     */
    readonly name: string;
    /**
     * 是否可见
     */
    readonly visible: boolean;
    /**
     * 是否禁用
     */
    readonly disabled: boolean;
    /**
     * skeleton
     */
    readonly skeleton: Skeleton;
    /**
     * 配置
     */
    readonly config: IBaseConfig;
    /**
     * 用户自定义render函数执行结果
     */
    readonly body: VNodeChild;

    show: () => void;
    hide: () => void;
    toggle: () => void;
    enable?: () => void;
    disable?: () => void;
    setParent: (area: Area<any, any>) => void;
    purge: () => void;
}

export interface IWidget extends IBaseWidget {
    /**
     * 对应组件
     */
    readonly content: VNodeChild;
    readonly isWidget: true;
    readonly align?: string;
    readonly title: string;
    readonly linked?: IPanel;
    readonly onClick?: (widget: IWidget) => void;
    readonly onInit?: (widget: IWidget) => void;
}

export interface IPanel extends IBaseWidget {
    /**
     * 对应组件
     */
    readonly content: VNodeChild;
    readonly isPanel: true;
    readonly props: IPanelProps;

}

export interface ITabPanel extends IBaseWidget {
    /**
     * 对应组件
     */
    readonly label: VNodeChild;
    readonly header: VNodeChild;
    readonly isTabPanel: true;
    readonly align?: string;
}

export function isWidget(obj: any): obj is IWidget {
    return obj && obj.isWidget;
}

export function isPanel(obj: any): obj is IPanel {
    return obj && obj.isPanel;
}

export function isTabPanel(obj: any): obj is ITabPanel {
    return obj && obj.isTabPanel;
}
