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
    IPanelProps,
    SkeletonEvents,
    isPanel,
    isPanelConfig,
    isWidgetPanelConfig,
} from './types';
import { Area } from './area';
import { Panel, Widget, Modal, WidgetModal, WidgetPanel } from './widget';

export class Skeleton {
    readonly leftArea: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig,
        Widget | WidgetModal | WidgetPanel
    >;

    readonly topArea: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig,
        Widget | WidgetModal | WidgetPanel
    >;

    readonly toolbar: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig,
        Widget | WidgetModal | WidgetPanel
    >;

    readonly bottomArea: Area<
        IWidgetConfig | IWidgetPanelConfig | IWidgetModalConfig,
        Widget | WidgetModal | WidgetPanel
    >;

    readonly globalArea: Area<IModalConfig, Modal>;

    readonly rightArea: Area<IPanelConfig, Panel>;

    readonly leftFloatArea: Area<IPanelConfig, Panel>;

    readonly mainArea: Area<IWidgetConfig | IPanelConfig, Widget | Panel>;

    readonly widgets: IWidget[] = [];

    constructor(readonly editor: Editor) {
        this.leftArea = new Area(this, 'leftArea', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config) as Widget;
        });
        this.topArea = new Area(this, 'topArea', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config) as Widget;
        });
        this.toolbar = new Area(this, 'toolbar', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config) as Widget;
        });
        this.bottomArea = new Area(this, 'bottomArea', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config) as Widget;
        });
        this.globalArea = new Area(this, 'globalArea', (config) => {
            if (isModal(config)) {
                return config;
            }
            return this.createWidget(config) as Modal;
        });
        this.rightArea = new Area(this, 'rightArea', (config) => {
            if (isPanel(config)) {
                return config;
            }
            const panel = this.createWidget(config) as Panel;
            return panel;
        });
        this.leftFloatArea = new Area(this, 'leftFloatArea', (config) => {
            if (isPanel(config)) {
                return config;
            }
            const panel = this.createWidget(config) as Panel;
            return panel;
        });
        this.mainArea = new Area(this, 'mainArea', (config) => {
            if (isWidget(config)) {
                return config;
            }
            return this.createWidget(config) as Widget;
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
        } else if (isPanelConfig(config)) {
            widget = new Panel(this, config as IPanelConfig);
        } else if (isWidgetPanelConfig(config)) {
            widget = new WidgetPanel(this, config as IWidgetPanelConfig);
        } else {
            widget = new Widget(this, config as IWidgetConfig);
        }
        this.widgets.push(widget);
        return widget;
    }

    add(
        config: IWidgetBaseConfig &
            (IWidgetConfig | IWidgetModalConfig | IPanelProps),
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
                return this.mainArea.add(parsedConfig as IWidgetConfig);

            default:
            // do nothing
        }
    }

    postEvent(event: SkeletonEvents, ...args: any[]) {
        this.editor.emit(event, ...args);
    }
}
