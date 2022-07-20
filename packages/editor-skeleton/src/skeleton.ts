import { Editor } from '@webank/letgo-editor-core';
import {
    IWidget,
    IWidgetBaseConfig,
    IWidgetConfig,
    IPanelConfig,
    IWidgetPanelConfig,
    IWidgetModalConfig,
    IModalConfig,
    isWidgetModalConfig,
    isWidget,
    isModalConfig,
    isModal,
    SkeletonEvents,
} from './types';
import { Area } from './area';
import { Panel, Widget, Modal, WidgetModal } from './widget';

export class Skeleton {
    readonly leftArea: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig
    >;

    readonly topArea: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig
    >;

    readonly globalArea: Area<IModalConfig, Modal>;

    readonly toolbar: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig
    >;

    readonly leftFixedArea: Area<IPanelConfig, Panel>;

    readonly leftFloatArea: Area<IPanelConfig, Panel>;

    readonly rightArea: Area<IPanelConfig, Panel>;

    readonly mainArea: Area<IWidgetConfig | IPanelConfig, Widget | Panel>;

    readonly bottomArea: Area<IPanelConfig, Panel>;

    readonly widgets: IWidget[] = [];

    constructor(readonly editor: Editor) {
        this.editor = editor;
        this.leftArea = new Area(this, 'leftArea', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config);
        });
        this.topArea = new Area(this, 'topArea', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config);
        });
        this.globalArea = new Area(this, 'globalArea', (config) => {
            if (isModal(config)) {
                return config;
            }
            return this.createWidget(config) as Modal;
        });
    }

    createWidget(config: IWidgetBaseConfig | IWidget) {
        if (isWidget(config)) {
            return config;
        }
        let widget;
        if (isModalConfig(config)) {
            widget = new Modal(this, config as IModalConfig);
        } else if (isWidgetModalConfig(config)) {
            widget = new WidgetModal(this, config as IWidgetModalConfig);
        } else {
            widget = new Widget(this, config as IWidgetConfig);
        }
        this.widgets.push(widget);
        return widget;
    }

    add(
        config: IWidgetBaseConfig | IWidgetConfig | IWidgetModalConfig,
        extraConfig?: Record<string, any>,
    ) {
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

            default:
            // do nothing
        }
    }

    postEvent(event: SkeletonEvents, ...args: any[]) {
        this.editor.emit(event, ...args);
    }
}
