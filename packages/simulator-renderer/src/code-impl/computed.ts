import { computed } from 'vue';
import { markShallowReactive } from '@webank/letgo-common';
import type { IJavascriptComputed } from '@webank/letgo-types';
import { ComputedLive } from '@webank/letgo-renderer';

export class ComputedImpl extends ComputedLive {
    constructor(data: IJavascriptComputed, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        markShallowReactive(this, {
            id: this.id,
        });
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
            value: this.value,
        };
    }
}
