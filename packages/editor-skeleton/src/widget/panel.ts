import type { VNode } from 'vue';
import { h } from 'vue';
import type { Skeleton } from '../skeleton';
import type { Area } from '../area';
import type { IPanelConfig, IPanelProps, IWidget } from '../types';
import PanelView from '../views/panel';
import { BaseWidget } from './baseWidget';

export class Panel extends BaseWidget implements IWidget {
    readonly isPanel = true;

    readonly props: IPanelProps;

    parent: Area<any, any>;

    setParent(parent: Area<any, any>) {
        if (parent === this.parent)
            return;

        if (this.parent)
            this.parent.remove(this);

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

    constructor(readonly skeleton: Skeleton, readonly config: IPanelConfig) {
        super(skeleton, config, false);
        this.props = config.props;
    }
}
