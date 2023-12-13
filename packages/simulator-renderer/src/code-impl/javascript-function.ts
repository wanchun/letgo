import { markComputed, markShallowReactive } from '@webank/letgo-common';
import { JavascriptFunctionLive } from '@webank/letgo-renderer';
import type { IJavascriptFunction } from '@webank/letgo-types';
import type { IJavascriptFunctionImpl } from '@webank/letgo-designer';

// 解析执行
export class JavascriptFunctionImpl extends JavascriptFunctionLive implements IJavascriptFunctionImpl {
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
            id: this.id,
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
