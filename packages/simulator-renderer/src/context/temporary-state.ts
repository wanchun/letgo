import { TemporaryStateImpl } from '@webank/letgo-renderer';
import { clone } from 'lodash-es';
import { CodeType, type ITemporaryState } from '@webank/letgo-types';
import type { WatchStopHandle } from 'vue';
import { watch } from 'vue';

export class SimulatorTemporaryState extends TemporaryStateImpl {
    unwatch: WatchStopHandle;
    constructor(data: ITemporaryState, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        this.changeDeps(deps || []);
        this.watchValue();
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
            if (this.ctx[dep].type === CodeType.JAVASCRIPT_QUERY)
                return this.ctx[dep].data;
            else
                return this.ctx[dep].value;
        }), () => {
            this.recalculateValue();
        });
    }
}
