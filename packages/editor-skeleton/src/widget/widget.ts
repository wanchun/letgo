import type { VNodeChild } from 'vue';
import { h } from 'vue';
import WidgetView from '../views/widget';
import { isModal, isPanel } from '../types';
import type { IWidget, IWidgetConfig } from '../types';
import type { Skeleton } from '../skeleton';
import { BaseWidget } from './base';
import type { Modal } from './modal';
import type { Panel } from './panel';

export class Widget extends BaseWidget implements IWidget {
    readonly isWidget = true;

    readonly align?: string;

    readonly title: string;

    readonly onClick?: (widget: IWidget) => void;

    readonly onInit?: (widget: IWidget) => void;

    private _modal?: Modal;

    private _panel?: Panel;

    get content(): VNodeChild {
        return h(WidgetView, {
            widget: this,
            key: this.id,
            onClick: (this.onClick || this._modal || this._panel)
                ? () => {
                        this._modal?.show();
                        this._panel?.show();
                        this.onClick?.(this);
                    }
                : undefined,
        });
    }

    get modal(): Modal | null {
        return this._modal;
    }

    get panel(): Panel | null {
        return this._panel;
    }

    constructor(readonly skeleton: Skeleton, readonly config: IWidgetConfig) {
        super(skeleton, config);
        const { props = {}, name } = config;

        this.align = props.align;
        this.title = props.title || name;
        this.onClick = props.onClick;
        this.onInit = props.onInit;

        this.onInit?.(this);
    }

    link(widget: Modal | Panel) {
        if (isModal(widget))
            this._modal = widget;

        if (isPanel(widget))
            this._panel = widget;
    }
}
