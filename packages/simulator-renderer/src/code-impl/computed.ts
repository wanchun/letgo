import { markComputed, markShallowReactive } from '@harrywan/letgo-common';
import type { IJavascriptComputed } from '@harrywan/letgo-types';
import { ComputedLive } from '@harrywan/letgo-renderer';
import type { IJavascriptComputedImpl } from '@harrywan/letgo-designer';

export class ComputedImpl extends ComputedLive implements IJavascriptComputedImpl {
    constructor(data: IJavascriptComputed, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        markShallowReactive(this, {
            id: this.id,
            value: this.value,
        });
        markComputed(this, ['view']);
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

    get view() {
        return {
            id: this.id,
            value: this.value,
        };
    }
}
