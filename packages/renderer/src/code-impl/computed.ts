import { isNil } from 'lodash-es';
import type { WatchStopHandle } from 'vue';
import { watch } from 'vue';
import type { IJavascriptComputed } from '@harrywan/letgo-types';
import { CodeType } from '@harrywan/letgo-types';

export class ComputedLive {
    id: string;
    type: CodeType.JAVASCRIPT_COMPUTED = CodeType.JAVASCRIPT_COMPUTED;
    deps: string[];
    ctx: Record<string, any>;
    value: any;
    funcBody: string;
    unwatch: WatchStopHandle;
    constructor(data: IJavascriptComputed, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.ctx = ctx;
        this.funcBody = data.funcBody;

        this.changeDeps(deps || []);
        this.value = this.funcBody ? this.executeInput(this.funcBody) : null;
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
            this.value = this.executeInput(this.funcBody);
        });
    }

    recalculateValue() {
        this.value = this.executeInput(this.funcBody);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('_ctx', `
            let result;
            with(_ctx) {
                result = (() => {${text}})();
            }
            return result;
        `);
            return fn(this.ctx);
        }
        catch (_) {
            console.error(_);
            return null;
        }
    }
}
