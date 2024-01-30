import type { VNodeChild } from 'vue';
import { h } from 'vue';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
import { isUndefined } from 'lodash-es';
import PanelView from '../views/panel';
import type { IPanel, IPanelConfig, IPanelProps } from '../types';
import type { Area } from '../area';
import type { Skeleton } from '../skeleton';
import { BaseWidget } from './base';

export class Panel extends BaseWidget implements IPanel {
    readonly isPanel = true;

    readonly props: IPanelProps;

    parent: Area<any, any>;

    private _isFixed: boolean;

    get isFixed() {
        return this._isFixed;
    }

    get content(): VNodeChild {
        return h(PanelView, {
            widget: this,
            key: this.id,
            ...this.props,
        });
    }

    constructor(readonly skeleton: Skeleton, readonly config: IPanelConfig) {
        super(skeleton, config, false);
        this.props = config.props;
        markShallowReactive(this, {
            _isFixed: isUndefined(config.defaultFixed) ? true : config.defaultFixed,
        });
        markComputed(this, ['isFixed']);
    }

    toggleFixed() {
        this._isFixed = !this.isFixed;
    }

    setParent(parent: Area<any, any>) {
        if (parent === this.parent)
            return;

        if (this.parent)
            this.parent.remove(this);

        this.parent = parent;
    }

    protected setVisible(flag: boolean) {
        if (flag === this._visible)
            return;

        if (flag) {
            this._visible = true;
            this.parent?.active(this);
        }
        else if (this.isReady) {
            this._visible = false;
            this.parent?.unActive(this);
        }
    }
}
