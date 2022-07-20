import { h, VNode, VNodeTypes } from 'vue';
import WidgetModalView from '../views/widget-modal';
import { Widget } from './widget';
import { Skeleton } from '../skeleton';
import { IWidgetModalConfig } from '../types';

export class WidgetModal extends Widget {
    get content(): VNode {
        return h(WidgetModalView, {
            widget: this,
            key: this.id,
            onClick: () => {
                this.onClick?.();
            },
        });
    }

    private _isModalReady = false;

    private _modalBody: VNodeTypes;

    get modalBody() {
        if (this._isModalReady) {
            return this._modalBody;
        }
        this._isModalReady = true;
        const { modalContent } = this.config;
        this._modalBody = modalContent({
            config: this.config,
            editor: this.skeleton.editor,
        });
        return this._modalBody;
    }

    constructor(
        readonly skeleton: Skeleton,
        readonly config: IWidgetModalConfig,
    ) {
        super(skeleton, config);
    }
}
