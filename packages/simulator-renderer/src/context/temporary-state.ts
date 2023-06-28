import { TemporaryStateImpl } from '@webank/letgo-renderer';
import { CodeType, type ITemporaryState } from '@webank/letgo-types';
import type { WatchStopHandle } from 'vue';
import { watch } from 'vue';

export class SimulatorTemporaryState extends TemporaryStateImpl {
    unwatch: WatchStopHandle;
    constructor(data: ITemporaryState, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        this.changeDeps(deps || []);
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
