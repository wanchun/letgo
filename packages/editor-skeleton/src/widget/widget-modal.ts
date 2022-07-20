import { ref, h, VNode, VNodeTypes, Ref } from 'vue';
import { uniqueId } from '@webank/letgo-utils';
import { Skeleton } from '../skeleton';
import { IWidget, IWidgetModalConfig } from '../types';
import WidgetView from '../views/widget';
import { Modal } from './modal';
import { debug } from 'console';

export class WidgetModal implements IWidget {
    readonly isWidget = true;

    readonly id = uniqueId('widget');

    readonly name: string;

    readonly align?: string;

    readonly title: string;

    readonly onClick: (widget: IWidget) => void;

    private _visible = ref(true);

    private _isReady = ref(false);

    private _disabled = ref(false);

    private _body: VNodeTypes;

    private _modal?: Modal;

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
        const { props = {}, name, modalContent, modalProps = {} } = config;
        this.name = name;
        this.align = props.align;
        this.title = props.title || name;
        this.onClick = props.onClick;
        if (props.onInit) {
            props.onInit.call(this, this);
        }
        this._modal = this.skeleton.add({
            type: 'Modal',
            name: this.name,
            area: 'globalArea',
            props: modalProps,
            content: modalContent,
        }) as Modal;
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
