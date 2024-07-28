import { markComputed, markShallowReactive } from '@webank/letgo-common';
import { JavascriptFunctionLive } from '@webank/letgo-renderer';
import type { IJavascriptFunction } from '@webank/letgo-types';

// 解析执行
export class JavascriptFunctionImpl extends JavascriptFunctionLive {
    constructor(data: IJavascriptFunction, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        markShallowReactive(this, {
            id: data.id,
            funcBody: data.funcBody,
        });

        markComputed(this, ['view']);
    }

    get view() {
        return {
            funcBody: this.funcBody,
        };
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Partial<IJavascriptFunction>) {
        Object.assign(this, content);
    }
}
