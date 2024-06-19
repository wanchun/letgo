import type { VNodeChild } from 'vue';
import { markComputed, markShallowReactive, uniqueId } from '@webank/letgo-common';
import type { Skeleton } from '../skeleton';
import type { Area } from '../area';
import type { IBaseConfig, IBaseWidget } from '../types';
import { IEnumSkeletonEvent } from '../types';

export class BaseWidget implements IBaseWidget {
    readonly id = uniqueId('widget');

    readonly name: string;

    protected isReady: boolean;

    protected _visible: boolean;

    protected _disabled: boolean;

    protected _body: VNodeChild;

    parent: Area<any, any>;

    get body() {
        if (this.isReady)
            return this._body;
        const { render } = this.config;
        this._body = render({
            widget: this,
            config: this.config,
            editor: this.skeleton.editor,
        });
        this.isReady = true;
        return this._body;
    }

    protected setVisible(flag: boolean) {
        if (flag === this._visible)
            return;

        if (flag)
            this._visible = true;

        else if (this.isReady)
            this._visible = false;

        this.skeleton.postEvent(
            this._visible
                ? IEnumSkeletonEvent.WIDGET_SHOW
                : IEnumSkeletonEvent.WIDGET_HIDE,
            this.name,
            this,
        );
    }

    get visible() {
        return this._visible;
    }

    hide() {
        this.setVisible(false);
    }

    show() {
        this.setVisible(true);
    }

    toggle() {
        this.setVisible(!this._visible);
    }

    protected setDisabled(flag: boolean) {
        if (this._disabled === flag)
            return;
        this._disabled = flag;
        this.skeleton.postEvent(
            flag
                ? IEnumSkeletonEvent.WIDGET_DISABLE
                : IEnumSkeletonEvent.WIDGET_ENABLE,
            this.name,
            this,
        );
    }

    disable() {
        this.setDisabled(true);
    }

    enable() {
        this.setDisabled(false);
    }

    get disabled() {
        return this._disabled;
    }

    constructor(
        readonly skeleton: Skeleton,
        readonly config: IBaseConfig,
        visible = true,
    ) {
        markShallowReactive(this, {
            isReady: false,
            _disabled: false,
            _visible: visible,
        });

        markComputed(this, ['disabled', 'visible']);

        this.name = config.name;
    }

    setParent(parent: Area<any, any>) {
        if (parent === this.parent)
            return;

        if (this.parent)
            this.parent.remove(this);

        parent.addItem(this);

        this.parent = parent;
    }

    purge() {
        this._body = null;
    }
}
