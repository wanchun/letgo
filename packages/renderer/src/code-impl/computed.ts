import { isNil } from 'lodash-es';
import type { WatchStopHandle } from 'vue';
import { watch } from 'vue';
import { attachContext, hasExpression, markComputed, markShallowReactive, replaceExpression } from '@webank/letgo-common';
import type { IJavascriptComputed } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';
import type { IJavascriptComputedImpl } from '@webank/letgo-designer';

export class ComputedImpl implements IJavascriptComputedImpl {
    id: string;
    type: CodeType.JAVASCRIPT_COMPUTED = CodeType.JAVASCRIPT_COMPUTED;
    deps: string[];
    ctx: Record<string, any>;
    value: any;
    funcBody: string;
    unwatch: WatchStopHandle;
    constructor(data: IJavascriptComputed, deps: string[], ctx: Record<string, any>) {
        markShallowReactive(this, {
            id: data.id,
            value: null,
        });
        markComputed(this, ['view']);

        this.ctx = ctx;
        this.funcBody = data.funcBody;

        this.value = this.executeInput(this.funcBody);
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
            this.value = this.executeInput(this.funcBody);
        });
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Record<string, any>) {
        if (content.funcBody) {
            this.funcBody = content.funcBody;
            this.value = this.executeInput(content.funcBody);
        }
    }

    recalculateValue() {
        this.value = this.executeInput(this.funcBody);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        if (hasExpression(text)) {
            const codeStr = replaceExpression(text, (_, expression) => {
                return attachContext(expression, name => this.deps.includes(name));
            });
            // eslint-disable-next-line no-new-func
            const fn = new Function('letgoCtx', codeStr);
            return fn(this.ctx);
        }
        else {
            // eslint-disable-next-line no-new-func
            const fn = new Function(this.funcBody);
            return fn(this.ctx);
        }
    }

    get view() {
        return {
            id: this.id,
            value: this.value,
        };
    }
}
