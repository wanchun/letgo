import { h, VNode } from 'vue';
import { Skeleton } from '../skeleton';
import { IWidget, IWidgetConfig } from '../types';
import WidgetView from '../views/widget';
import { BaseWidget } from './baseWidget';

export class Widget extends BaseWidget implements IWidget {
    readonly align?: string;

    readonly title: string;

    readonly onClick: (widget: IWidget) => void;

    get content(): VNode {
        return h(WidgetView, {
            widget: this,
            key: this.id,
            onClick: () => {
                this.onClick?.(this);
            },
        });
    }

    constructor(readonly skeleton: Skeleton, readonly config: IWidgetConfig) {
        super(skeleton, config);
        const { props = {}, name } = config;
        this.align = props.align;
        this.title = props.title || name;
        this.onClick = props.onClick;
        if (props.onInit) {
            props.onInit.call(this, this);
        }
    }
}
