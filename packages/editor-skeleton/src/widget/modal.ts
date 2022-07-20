import { ref, h, VNode, VNodeTypes, Ref } from 'vue';
import { uniqueId } from '@webank/letgo-utils';
import { Skeleton } from '../skeleton';
import { IWidget, IModalConfig, IModalProps } from '../types';
import ModalView from '../views/modal';
import { debug } from 'console';

export class Modal implements IWidget {
    readonly isPanel = true;

    readonly isWidget = true;

    readonly id = uniqueId('widget');

    readonly name: string;

    readonly props: IModalProps;

    private _visible = ref(false);

    private _isReady = ref(false);

    private _disabled = ref(false);

    private _body: VNodeTypes;

    get visible(): Ref<boolean> {
        return this._visible;
    }

    get body() {
        if (this._isReady.value) {
            return this._body;
        }
        this._isReady.value = true;
        const { content } = this.config;
        this._body = content({
            config: this.config,
            editor: this.skeleton.editor,
        });
        return this._body;
    }

    get content(): VNode {
        return h(ModalView, {
            widget: this,
            key: this.id,
        });
    }

    constructor(readonly skeleton: Skeleton, readonly config: IModalConfig) {
        const { props = {}, name } = config;
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
        this.name = name;
        this.props = props;
    }

    hide() {
        this.setVisible(false);
    }

    show() {
        this.setVisible(true);
    }

    setVisible(flag: boolean) {
        if (flag === this._visible.value) {
            return;
        }
        if (flag) {
            this._visible.value = true;
        } else if (this._isReady.value) {
            this._visible.value = false;
        }
    }

    toggle() {
        this.setVisible(!this._visible);
    }

    private setDisabled(flag: boolean) {
        if (this._disabled.value === flag) return;
        this._disabled.value = flag;
    }

    disable() {
        this.setDisabled(true);
    }

    enable() {
        this.setDisabled(false);
    }

    get disabled(): Ref<boolean> {
        return this._disabled;
    }
}
