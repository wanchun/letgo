import { markComputed, markShallowReactive } from '@webank/letgo-utils';
import type { IFailureCondition, IJavascriptQuery } from '@webank/letgo-types';
import type { IJavascriptQueryImpl } from '@webank/letgo-designer';
import { CodeType, RunCondition } from '@webank/letgo-types';

// 解析执行
export class JavascriptQueryImpl implements IJavascriptQueryImpl {
    id: string;
    type: CodeType.JAVASCRIPT_QUERY = CodeType.JAVASCRIPT_QUERY;
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
    queryFailureCondition: IFailureCondition[];
    constructor(data: IJavascriptQuery, ctx: Record<string, any>) {
        markShallowReactive(this, {
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

    changeContent(content: Partial<IJavascriptQuery>) {
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
