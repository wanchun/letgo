import type { IJavascriptFunction } from '@harrywan/letgo-types';
import { CodeType } from '@harrywan/letgo-types';

// 解析执行
export class JavascriptFunctionLive {
    id: string;
    type: CodeType.JAVASCRIPT_FUNCTION = CodeType.JAVASCRIPT_FUNCTION;
    ctx: Record<string, any>;
    deps: string[];
    funcBody: string;

    constructor(data: IJavascriptFunction, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.funcBody = data.funcBody;
        this.ctx = ctx;
        this.deps = deps;
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
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
