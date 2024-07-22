import type { VNodeChild } from 'vue';
import { h } from 'vue';
import WidgetView from '../views/widget';
import type { IWidget, IWidgetConfig } from '../types';
import type { Skeleton } from '../skeleton';
import { BaseWidget } from './base';
import type { Panel } from './panel';

export class Widget extends BaseWidget implements IWidget {
    readonly isWidget = true;

    readonly align?: string;

    readonly title: string;

    readonly onClick?: (widget: IWidget) => void;

    readonly onInit?: (widget: IWidget) => void;

    private _linked?: Panel;

    get content(): VNodeChild {
        return h(WidgetView, {
            widget: this,
            key: this.id,
            onClick: (this.onClick || this._linked)
                ? () => {
                        this._linked?.toggle();
                        this.onClick?.(this);
                    }
                : undefined,
        });
    }

    get linked(): Panel | undefined {
        return this._linked;
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

    link(widget: Panel) {
        this._linked = widget;
        return this;
    }
}
