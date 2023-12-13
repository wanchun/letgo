import type { IJavascriptFunction } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';

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

    async trigger(...args: any[]) {
        if (this.funcBody) {
            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function('_ctx', 'params', `
            let result;
            with(_ctx) {
                result = (${this.funcBody})(...params);
            }
            return result;
        `);
                return await fn(this.ctx, args);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
}
