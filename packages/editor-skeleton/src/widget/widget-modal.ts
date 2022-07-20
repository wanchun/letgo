import { h, VNode } from 'vue';
import { Skeleton } from '../skeleton';
import { IWidget, IWidgetModalConfig } from '../types';
import WidgetView from '../views/widget';
import { Modal } from './modal';
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
                console.log(this);
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
        if (props.onInit) {
            props.onInit.call(this, this);
        }
        this._modal = this.skeleton.add({
            type: 'Modal',
            name: modalName ?? `${this.name}Modal`,
            area: 'globalArea',
            props: modalProps,
            content: modalContent,
        }) as Modal;
    }
}
