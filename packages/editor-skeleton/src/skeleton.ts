import type { IPublicEditor } from '@webank/letgo-types';
import type { Designer } from '@webank/letgo-designer';
import type {
    IBaseWidget,
    IEnumSkeletonEvent,
    IModalConfig,
    IPanelConfig,
    IUnionConfig,
    IWidgetConfig,
} from './types';
import {
    isModalConfig,
    isPanelConfig,
    isWidgetConfig,
} from './types';
import { Area } from './area';
import { Modal, Panel, Widget } from './widget';

export type ReturnTypeOfCreateWidget<T> =
    T extends IPanelConfig
        ? Panel
        : T extends IModalConfig
            ? Modal
            : T extends IWidgetConfig
                ? Widget
                : never;

export class Skeleton {
    readonly leftArea: Area<IWidgetConfig, Widget>;

    readonly topArea: Area<IWidgetConfig, Widget>;

    readonly toolbar: Area<IWidgetConfig, Widget>;

    readonly bottomArea: Area<IWidgetConfig, Widget>;

    readonly globalArea: Area<IModalConfig, Modal>;

    readonly rightArea: Area<IPanelConfig, Panel>;

    readonly leftFloatArea: Area<IPanelConfig, Panel>;

    readonly mainArea: Area<IWidgetConfig | IPanelConfig, Widget | Panel>;

    readonly widgets: IBaseWidget[] = [];

    constructor(readonly editor: IPublicEditor, readonly designer: Designer) {
        this.leftArea = new Area(this, 'leftArea', (config) => {
            return this.createWidget(config);
        });
        this.topArea = new Area(this, 'topArea', (config) => {
            return this.createWidget(config);
        });
        this.toolbar = new Area(this, 'toolbar', (config) => {
            return this.createWidget(config);
        });
        this.bottomArea = new Area(this, 'bottomArea', (config) => {
            return this.createWidget(config);
        });
        this.globalArea = new Area(this, 'globalArea', (config) => {
            return this.createWidget(config);
        });
        this.rightArea = new Area(this, 'rightArea', (config) => {
            return this.createWidget(config);
        });
        this.leftFloatArea = new Area(this, 'leftFloatArea', (config) => {
            return this.createWidget(config);
        });
        this.mainArea = new Area(this, 'mainArea', (config) => {
            return this.createWidget(config);
        });
    }

    createWidget<T = IUnionConfig>(config: T) {
        let widget;
        if (isModalConfig(config))
            widget = new Modal(this, config);

        else if (isPanelConfig(config))
            widget = new Panel(this, config);

        else if (isWidgetConfig(config))
            widget = new Widget(this, config);

        if (widget)
            this.widgets.push(widget);

        return widget as ReturnTypeOfCreateWidget<T>;
    }

    add(config: IUnionConfig, extraConfig?: Record<string, any>) {
        const parsedConfig = {
            ...config,
            ...extraConfig,
        };
        const { area } = parsedConfig;
        switch (area) {
            case 'leftArea':
            case 'left':
                return this.leftArea.add(parsedConfig as IWidgetConfig);
            case 'topArea':
            case 'top':
                return this.topArea.add(parsedConfig as IWidgetConfig);
            case 'global':
            case 'globalArea':
                return this.globalArea.add(parsedConfig as IModalConfig);
            case 'right':
            case 'rightArea':
                return this.rightArea.add(parsedConfig as IPanelConfig);
            case 'toolbar':
                return this.toolbar.add(parsedConfig as IWidgetConfig);
            case 'bottom':
            case 'bottomArea':
                return this.bottomArea.add(parsedConfig as IWidgetConfig);
            case 'leftFloatArea':
                return this.leftFloatArea.add(parsedConfig as IPanelConfig);
            case 'main':
            case 'mainArea':
                return this.mainArea.add(
                    parsedConfig as IWidgetConfig | IPanelConfig,
                );

            default:
            // do nothing
        }
    }

    postEvent(event: IEnumSkeletonEvent, ...args: any[]) {
        this.editor.emit(event, ...args);
    }
}
