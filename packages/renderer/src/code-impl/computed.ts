import { isNil } from 'lodash-es';
import { computed } from 'vue';
import type { WatchStopHandle } from 'vue';
import { markShallowReactive } from '@harrywan/letgo-common';
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
        markShallowReactive(this, {
            value: this.funcBody ? computed(() => this.executeInput(this.funcBody)) : null,
        });
    }

    changeDeps(deps: string[]): void {
        this.deps = deps;
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
