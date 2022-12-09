import { h, VNode } from 'vue';
import { Skeleton } from '../skeleton';
import { Area } from '../area';
import { IWidget, IPanelConfig, IPanelProps } from '../types';
import PanelView from '../views/panel';
import { BaseWidget } from './baseWidget';

export class Panel extends BaseWidget implements IWidget {
    readonly isPanel = true;

    readonly props: IPanelProps;

    parent: Area<any, any>;

    setParent(parent: Area<any, any>) {
        if (parent === this.parent) {
            return;
        }
        if (this.parent) {
            this.parent.remove(this);
        }
        this.parent = parent;
    }

    get content(): VNode {
        return h(PanelView, {
            widget: this,
            key: this.id,
            ...this.props,
        });
    }

    protected setVisible(flag: boolean) {
        if (flag === this._visible.value) {
            return;
        }
        if (flag) {
            this._visible.value = true;
            this.parent?.active(this);
        } else if (this.isReady.value) {
            this._visible.value = false;
            this.parent?.unActive(this);
        }
    }

    constructor(readonly skeleton: Skeleton, readonly config: IPanelConfig) {
        super(skeleton, config, false);
        this.props = config.props;
    }
}
