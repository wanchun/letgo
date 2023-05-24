import { JAVASCRIPT_QUERY } from '../../constants';
import { markComputed, markReactive } from '../../helper';
import type { FailureCondition, JavascriptQuery } from '../../interface';
import { RunCondition } from '../../interface';

// 解析执行
export class JavascriptQueryImpl {
    id: string;
    type = JAVASCRIPT_QUERY;
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
        markReactive(this, {
            id: data.id,
            query: data.query,
            enableTransformer: data.enableTransformer || false,
            transformer: data.transformer,
            showSuccessToaster: data.showSuccessToaster || false,
            successMessage: data.successMessage || '',
            queryTimeout: data.queryTimeout || 10000,
            runCondition: data.runCondition || RunCondition.MANUAL,
            queryFailureCondition: data.queryFailureCondition || [],

            data: null,
            error: null,
        });
        markComputed(this, ['view']);
        this.ctx = ctx;
    }

    get view() {
        return {
            id: this.id,
            query: this.query,
            enableTransformer: this.enableTransformer,
            transformer: this.transformer,
            showSuccessToaster: this.showSuccessToaster,
            successMessage: this.successMessage,
            queryTimeout: this.queryTimeout,
            runCondition: this.runCondition,
            queryFailureCondition: this.queryFailureCondition,

            data: this.data,
            error: this.error,
        };
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Partial<JavascriptQuery>) {
        Object.assign(this, content);
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
