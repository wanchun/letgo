import { Editor } from '@webank/letgo-editor-core';
import {
    IWidget,
    IWidgetBaseConfig,
    IWidgetConfig,
    IPanelConfig,
    IPanelWidgetConfig,
    IWidgetModalConfig,
    isWidgetModalConfig,
    isWidget,
} from './types';
import { Area } from './area';
import { Panel, Widget, WidgetModal } from './widget';

export class Skeleton {
    readonly leftArea: Area<
        IWidgetConfig | IPanelWidgetConfig | IWidgetModalConfig
    >;

    readonly topArea: Area<
        IWidgetConfig | IPanelWidgetConfig | IWidgetModalConfig
    >;

    readonly toolbar: Area<
        IWidgetConfig | IPanelWidgetConfig | IWidgetModalConfig
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
        // this.toolbar = new Area(
        //     this,
        //     'toolbar',
        //     (config) => {
        //         if (isWidget(config)) {
        //             return config;
        //         }
        //         return this.createWidget(config);
        //     },
        //     false,
        // );
        // this.leftFixedArea = new Area(
        //     this,
        //     'leftFixedArea',
        //     (config) => {
        //         if (isPanel(config)) {
        //             return config;
        //         }
        //         return this.createPanel(config);
        //     },
        //     true,
        // );
        // this.leftFloatArea = new Area(
        //     this,
        //     'leftFloatArea',
        //     (config) => {
        //         if (isPanel(config)) {
        //             return config;
        //         }
        //         return this.createPanel(config);
        //     },
        //     true,
        // );
        // this.rightArea = new Area(
        //     this,
        //     'rightArea',
        //     (config) => {
        //         if (isPanel(config)) {
        //             return config;
        //         }
        //         return this.createPanel(config);
        //     },
        //     false,
        //     true,
        // );
        // this.mainArea = new Area(
        //     this,
        //     'mainArea',
        //     (config) => {
        //         if (isWidget(config)) {
        //             return config as Widget;
        //         }
        //         return this.createWidget(config) as Widget;
        //     },
        //     true,
        //     true,
        // );
        // this.bottomArea = new Area(
        //     this,
        //     'bottomArea',
        //     (config) => {
        //         if (isPanel(config)) {
        //             return config;
        //         }
        //         return this.createPanel(config);
        //     },
        //     true,
        // );
    }

    createWidget(config: IWidgetBaseConfig | IWidget) {
        if (isWidget(config)) {
            return config;
        }
        let widget;
        if (isWidgetModalConfig(config)) {
            widget = new WidgetModal(this, config as IWidgetModalConfig);
        } else {
            widget = new Widget(this, config as IWidgetConfig);
        }
        this.widgets.push(widget);
        return widget;
    }

    add(config: IWidgetBaseConfig, extraConfig?: Record<string, any>) {
        const parsedConfig = {
            ...config,
            ...extraConfig,
        };
        const { area } = parsedConfig;
        switch (area) {
            case 'leftArea':
            case 'left':
                return this.leftArea.add(parsedConfig as IWidgetConfig);
            case 'rightArea':
            case 'right':
                return this.rightArea.add(parsedConfig as IPanelConfig);
            case 'topArea':
            case 'top':
                return this.topArea.add(parsedConfig as IWidgetConfig);
            case 'toolbar':
                return this.toolbar.add(parsedConfig as IWidgetConfig);
            case 'mainArea':
            case 'main':
            case 'center':
            case 'centerArea':
                return this.mainArea.add(parsedConfig as IWidgetConfig);
            case 'bottomArea':
            case 'bottom':
                return this.bottomArea.add(parsedConfig as IPanelConfig);
            case 'leftFixedArea':
                return this.leftFixedArea.add(parsedConfig as IPanelConfig);
            case 'leftFloatArea':
                return this.leftFloatArea.add(parsedConfig as IPanelConfig);
            default:
            // do nothing
        }
    }
}
