import { markComputed, markShallowReactive } from '@harrywan/letgo-common';
import { JavascriptFunctionLive } from '@harrywan/letgo-renderer';
import type { IJavascriptFunction } from '@harrywan/letgo-types';
import type { IJavascriptFunctionImpl } from '@harrywan/letgo-designer';

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

    async trigger() {
        if (this.funcBody) {
            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function('_ctx', `
            let result;
            with(_ctx) {
                result = (${this.funcBody})();
            }
            return result;
        `);
                return await fn(this.ctx);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
}
