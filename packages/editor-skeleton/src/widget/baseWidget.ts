import { ref, Ref, watch, VNodeTypes } from 'vue';
import { uniqueId } from '@webank/letgo-utils';
import { Skeleton } from '../skeleton';
import { IWidgetBaseConfig, SkeletonEvents } from '../types';

export class BaseWidget {
    readonly isWidget = true;

    readonly id = uniqueId('widget');

    readonly name: string;

    protected isReady = ref(false);

    protected _visible = ref(true);

    protected _disabled = ref(false);

    protected _body: VNodeTypes;

    get body() {
        if (this.isReady.value) {
            return this._body;
        }
        this.isReady.value = true;
        const { content } = this.config;
        this._body = content({
            config: this.config,
            editor: this.skeleton.editor,
        });
        return this._body;
    }

    protected setVisible(flag: boolean) {
        if (flag === this._visible.value) {
            return;
        }
        if (flag) {
            this._visible.value = true;
        } else if (this.isReady.value) {
            this._visible.value = false;
        }
    }

    get visible(): Ref<boolean> {
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

    constructor(
        readonly skeleton: Skeleton,
        readonly config: IWidgetBaseConfig,
        visible = true,
    ) {
        this._visible.value = visible;
        this.name = config.name;
        watch(this.visible, (visible) => {
            this.skeleton.postEvent(
                visible
                    ? SkeletonEvents.WIDGET_SHOW
                    : SkeletonEvents.WIDGET_HIDE,
                this.name,
                this,
            );
        });
        watch(this.disabled, (disabled) => {
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
