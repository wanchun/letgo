import type { VNodeTypes } from 'vue';
import { watch } from 'vue';
import { markComputed, markReactive, uniqueId } from '@webank/letgo-utils';
import type { Skeleton } from '../skeleton';
import type { IWidgetBaseConfig } from '../types';
import { SkeletonEvents } from '../types';

export class BaseWidget {
    readonly isWidget = true;

    readonly id = uniqueId('widget');

    readonly name: string;

    protected isReady: boolean; // = ref(false);

    protected _visible: boolean; // = ref(true);

    protected _disabled: boolean; // = ref(false);

    protected _body: VNodeTypes;

    get body() {
        if (this.isReady)
            return this._body;

        this.isReady = true;
        const { content } = this.config;
        this._body = content({
            config: this.config,
            editor: this.skeleton.editor,
        });
        return this._body;
    }

    protected setVisible(flag: boolean) {
        if (flag === this._visible)
            return;

        if (flag)
            this._visible = true;

        else if (this.isReady)
            this._visible = false;
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
        readonly config: IWidgetBaseConfig,
        visible = true,
    ) {
        markReactive(this, {
            isReady: false,
            _disabled: false,
            _visible: visible,
        });
        markComputed(this, ['disabled', 'visible']);

        this.name = config.name;
        watch(() => this.visible, (visible) => {
            this.skeleton.postEvent(
                visible
                    ? SkeletonEvents.WIDGET_SHOW
                    : SkeletonEvents.WIDGET_HIDE,
                this.name,
                this,
            );
        });
        watch(() => this.disabled, (disabled) => {
            this.skeleton.postEvent(
                disabled
                    ? SkeletonEvents.WIDGET_DISABLE
                    : SkeletonEvents.WIDGET_ENABLE,
                this.name,
                this,
            );
        });
    }
}
