import { markComputed, markShallowReactive } from '@harrywan/letgo-common';
import type { IJavascriptFunction } from '@harrywan/letgo-types';
import type { IJavascriptFunctionImpl } from '@harrywan/letgo-designer';
import { CodeType } from '@harrywan/letgo-types';

// 解析执行
export class JavascriptFunctionImpl implements IJavascriptFunctionImpl {
    id: string;
    type: CodeType.JAVASCRIPT_FUNCTION = CodeType.JAVASCRIPT_FUNCTION;
    ctx: Record<string, any>;
    deps: string[];
    funcBody: string;

    constructor(data: IJavascriptFunction, deps: string[], ctx: Record<string, any>) {
        markShallowReactive(this, {
            id: data.id,
            funcBody: data.funcBody,
        });
        markComputed(this, ['view']);
        this.ctx = ctx;
        this.deps = deps;
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
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
