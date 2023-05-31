import type { VNodeChild } from 'vue';
import { h } from 'vue';
import ModalView from '../views/modal';
import type { IModal, IModalConfig, IModalProps } from '../types';
import type { Skeleton } from '../skeleton';
import { BaseWidget } from './base';

export class Modal extends BaseWidget implements IModal {
    readonly isModal = true;

    readonly props: IModalProps;

    get content(): VNodeChild {
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
            if (onOk)
                onOk.call(this, this);
        };
        props.onCancel = () => {
            if (onCancel)
                onCancel.call(this, this);
        };
        this.props = props;
    }
}
