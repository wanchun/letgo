import type { VNode } from 'vue';
import { h } from 'vue';
import type { Skeleton } from '../skeleton';
import type { IWidget, IWidgetModalConfig } from '../types';
import WidgetView from '../views/widget';
import type { Modal } from './modal';
import { BaseWidget } from './baseWidget';

export class WidgetModal extends BaseWidget implements IWidget {
    readonly align?: string;

    readonly title: string;

    readonly onClick: (widget: IWidget) => void;

    private _modal?: Modal;

    get content(): VNode {
        return h(WidgetView, {
            widget: this,
            key: this.id,
            onClick: () => {
                this._modal.show();
                this.onClick?.(this);
            },
        });
    }

    constructor(
        readonly skeleton: Skeleton,
        readonly config: IWidgetModalConfig,
    ) {
        super(skeleton, config);
        const {
            props = {},
            name,
            modalName,
            modalContent,
            modalProps = {},
        } = config;
        this.align = props.align;
        this.title = props.title || name;
        this.onClick = props.onClick;
        if (props.onInit)
            props.onInit.call(this, this);

        this._modal = this.skeleton.add({
            type: 'Modal',
            name: modalName ?? `${this.name}Modal`,
            area: 'globalArea',
            props: modalProps,
            content: modalContent,
        }) as Modal;
    }
}
