import type { VNodeChild } from 'vue';
import { h } from 'vue';
import TabHeaderView from '../views/tabHeader';
import type { ITabPanel, ITabPanelConfig } from '../types';
import type { Skeleton } from '../skeleton';
import { BaseWidget } from './base';

export class TabPanel extends BaseWidget implements ITabPanel {
    readonly isTabPanel = true;

    readonly align?: string;

    protected _header: VNodeChild;

    get header() {
        const { renderHeader } = this.config;
        return renderHeader({
            widget: this,
            config: this.config,
            editor: this.skeleton.editor,
        });
    }

    get label(): VNodeChild {
        return h(TabHeaderView, {
            widget: this,
            key: this.id,
            onClick: () => {
                this.toggle();
            },
        });
    }

    constructor(readonly skeleton: Skeleton, readonly config: ITabPanelConfig) {
        super(skeleton, config, false);
        const { props = {} } = config;
        this.align = props.align;
    }

    toggle() {
        this.setVisible(!this._visible);
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
