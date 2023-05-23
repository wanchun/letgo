import type { FailureCondition, JavascriptQuery } from '../../interface';
import { RunCondition } from '../../interface';

// 解析执行
export class JavascriptQueryImpl {
    id: string;
    ctx: Record<string, any>;
    data: any = null;
    error: string = null;
    showSuccessToaster: boolean;
    successMessage: string;
    queryTimeout: number;
    query: string;
    enableTransformer: boolean;
    transformer: string;
    runCondition: RunCondition;
    queryFailureCondition: FailureCondition[];
    constructor(data: JavascriptQuery, ctx: Record<string, any>) {
        this.id = data.id;
        this.ctx = ctx;

        this.query = data.query;
        this.enableTransformer = data.enableTransformer || false;
        this.transformer = data.transformer;

        this.showSuccessToaster = data.showSuccessToaster || false;
        this.successMessage = data.successMessage || '';

        this.queryTimeout = data.queryTimeout || 10000;

        this.runCondition = data.runCondition || RunCondition.MANUAL;

        this.queryFailureCondition = data.queryFailureCondition || [];
    }

    changeId(id: string) {
        this.id = id;
    }

    trigger() {
        if (this.query) {
            try {
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
                // TODO 其他条件的实现
                this.data = fn(this.ctx);
            }
            catch (err) {
                if (err instanceof Error)
                    this.error = err.message;
            }
        }
    }

    reset() {
        this.data = null;
        this.error = null;
    }

    getState() {
        return {
            id: this.id,
            data: this.data,
            error: this.error,
            enableTransformer: this.enableTransformer,
            transformer: this.transformer,
            showSuccessToaster: this.showSuccessToaster,
            successMessage: this.successMessage,
            queryTimeout: this.queryTimeout,
            runCondition: this.runCondition,
            queryFailureCondition: this.queryFailureCondition,
        };
    }
}
