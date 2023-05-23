import type { JavascriptQuery } from '../../interface';

// 解析执行
export class JavascriptQueryImpl {
    id: string;
    deps: string[];
    ctx: Record<string, any>;
    data: any;
    query: string;
    constructor(data: JavascriptQuery, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.deps = deps || [];
        this.ctx = ctx;
        this.query = data.query;
    }

    changeId(id: string) {
        this.id = id;
    }

    trigger() {
        if (this.query) {
            // eslint-disable-next-line no-new-func
            const fn = new Function('_ctx', `
                let result;
                with(_ctx) {
                    result = (() => {
                        ${this.query}
                    })();
                }
                return result;
            `);
            this.data = fn(this.ctx);
        }
    }

    getState() {
        return {
            id: this.id,
            data: this.data,
        };
    }
}
