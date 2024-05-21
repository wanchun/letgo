import { TemporaryStateLive } from '@webank/letgo-renderer';
import { markComputed, markReactive } from '@webank/letgo-common';
import { clone } from 'lodash-es';
import { IEnumCodeType, type ITemporaryState } from '@webank/letgo-types';
import type { WatchStopHandle } from 'vue';
import { watch } from 'vue';

export class TemporaryStateImpl extends TemporaryStateLive {
    unwatch: WatchStopHandle;
    constructor(data: ITemporaryState, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        markReactive(this, {
            id: this.id,
        });
        markComputed(this, ['view']);

        this.changeDeps(deps || []);
        this.watchValue();
    }

    get view() {
        return {
            id: this.id,
            value: this.value,
        };
    }

    get hint() {
        return {
            value: this.value,
            setValue: this.setValue,
            setIn: this.setIn,
        };
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Record<string, any>) {
        if (content.initValue) {
            this.initValue = content.initValue;
            this.value = this.executeInput(content.initValue);
        }
    }

    watchValue() {
        watch(() => this.value, (val, oldVal) => {
            // 强刷 editor 的 state 状态
            if (val === oldVal)
                this.value = clone(val);
        }, {
            deep: true,
        });
    }

    changeDeps(deps: string[]): void {
        this.deps = deps;
        this.toWatch(deps);
    }

    toWatch(deps: string[]) {
        if (this.unwatch)
            this.unwatch();
        if (!deps || deps.length === 0)
            return;
        this.unwatch = watch(() => deps.map((dep) => {
            if (this.ctx[dep].type === IEnumCodeType.JAVASCRIPT_QUERY)
                return this.ctx[dep].data;
            else
                return this.ctx[dep].value;
        }), () => {
            this.recalculateValue();
        });
    }
}
