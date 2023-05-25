import type { VNode } from 'vue';
import { h } from 'vue';
import type { Skeleton } from '../skeleton';
import type { IWidget, IWidgetPanelConfig } from '../types';
import WidgetView from '../views/widget';
import type { Panel } from './panel';
import { BaseWidget } from './baseWidget';

export class WidgetPanel extends BaseWidget implements IWidget {
    readonly align?: string;

    readonly title: string;

    readonly onClick: (widget: IWidget) => void;

    private _panel?: Panel;

    get content(): VNode {
        return h(WidgetView, {
            widget: this,
            key: this.id,
            onClick: () => {
                this._panel.show();
                this.onClick?.(this);
            },
        });
    }

    get panel(): Panel {
        return this._panel;
    }

    constructor(
        readonly skeleton: Skeleton,
        readonly config: IWidgetPanelConfig,
    ) {
        super(skeleton, config);
        const {
            props = {},
            name,
            panelName,
            panelContent,
            panelProps = {},
        } = config;
        this.align = props.align;
        this.title = props.title || name;
        this.onClick = props.onClick;
        if (props.onInit)
            props.onInit.call(this, this);

        this._panel = this.skeleton.add({
            type: 'Panel',
            name: panelName ?? `${this.name}Panel`,
            area: panelProps.area ?? 'leftFloatArea',
            props: panelProps,
            content: panelContent,
        }) as Panel;
    }
}
