import { h, VNode } from 'vue';
import { Skeleton } from '../skeleton';
import { IWidget, IModalConfig, IModalProps } from '../types';
import ModalView from '../views/modal';
import { BaseWidget } from './baseWidget';

export class Modal extends BaseWidget implements IWidget {
    readonly isModal = true;

    readonly props: IModalProps;

    get content(): VNode {
        return h(ModalView, {
            widget: this,
            key: this.id,
        });
    }

    constructor(readonly skeleton: Skeleton, readonly config: IModalConfig) {
        super(skeleton, config, false);
        const { props = {} } = config;
        const { onOk, onCancel } = props;
        props.onOk = () => {
            if (onOk) {
                onOk.call(this, this);
            }
        };
        props.onCancel = () => {
            if (onCancel) {
                onCancel.call(this, this);
            }
        };
        this.props = props;
        this.hide();
    }
}
