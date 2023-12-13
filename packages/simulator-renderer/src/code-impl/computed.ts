import { computed } from 'vue';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
import type { IJavascriptComputed } from '@webank/letgo-types';
import { ComputedLive } from '@webank/letgo-renderer';
import type { IJavascriptComputedImpl } from '@webank/letgo-designer';

export class ComputedImpl extends ComputedLive implements IJavascriptComputedImpl {
    constructor(data: IJavascriptComputed, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        markShallowReactive(this, {
            id: this.id,
        });
        markComputed(this, ['view']);
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Record<string, any>) {
        if (content.funcBody) {
            this.funcBody = content.funcBody;
            this.value = computed(() => this.executeInput(content.funcBody));
        }
    }

    get view() {
        return {
            id: this.id,
            value: this.value,
        };
    }
}
