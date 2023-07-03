import { eventHandlersToJsFunction, executeExpression, markComputed, markShallowReactive } from '@webank/letgo-common';
import type { IFailureCondition, IJavascriptQuery, IPublicTypeEventHandler } from '@webank/letgo-types';
import { CodeType, ResourceType, RunCondition } from '@webank/letgo-types';
import type { IJavascriptQueryImpl } from '@webank/letgo-designer';
import { funcSchemaToFunc } from '../parse';

// 解析执行
export class JavascriptQueryImpl implements IJavascriptQueryImpl {
    id: string;
    resourceType: ResourceType;
    type: CodeType.JAVASCRIPT_QUERY = CodeType.JAVASCRIPT_QUERY;
    ctx: Record<string, any>;
    data: any = null;
    error: string = null;
    deps: string[];

    api: string;
    params: string;
    method: string;

    showFailureToaster: boolean;
    showSuccessToaster: boolean;
    successMessage: string;
    queryTimeout: number;
    query: string;
    enableCaching: boolean;
    cacheDuration: number;
    runCondition: RunCondition;
    failureEvent: IPublicTypeEventHandler[];
    successEventInstances: (() => void)[];
    failureEventInstances: (() => void)[];
    successEvent: IPublicTypeEventHandler[];
    queryFailureCondition: IFailureCondition[];
    cacheTime: number;
    constructor(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
        markShallowReactive(this, {
            id: data.id,
            query: data.query,
            enableCaching: false,
            cacheDuration: null,
            showFailureToaster: data.showFailureToaster || false,
            showSuccessToaster: data.showSuccessToaster || false,
            successMessage: data.successMessage || '',
            queryTimeout: data.queryTimeout,
            runCondition: data.runCondition || RunCondition.MANUAL,
            queryFailureCondition: data.queryFailureCondition || [],
            successEvent: data.successEvent,
            failureEvent: data.failureEvent,

            data: null,
            error: null,
        });
        markComputed(this, ['view']);

        this.resourceType = data.resourceType;
        this.ctx = ctx;
        this.deps = deps;

        this.successEventInstances = this.eventSchemaToFunc(this.successEvent);
        this.failureEventInstances = this.eventSchemaToFunc(this.successEvent);
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
    }

    eventSchemaToFunc(events: IPublicTypeEventHandler[] = []) {
        if (!events.length)
            return [];
        const jsExpressionMap = eventHandlersToJsFunction(events);
        const jsExpressions = Object.keys(jsExpressionMap).reduce((acc, cur) => {
            acc = acc.concat(jsExpressionMap[cur]);
            return acc;
        }, []);
        return jsExpressions.map(item => funcSchemaToFunc(item, this.ctx));
    }

    get view() {
        return {
            id: this.id,
            query: this.query,
            enableCaching: this.enableCaching,
            cacheDuration: this.cacheDuration,
            showFailureToaster: this.showFailureToaster,
            showSuccessToaster: this.showSuccessToaster,
            successMessage: this.successMessage,
            queryTimeout: this.queryTimeout,
            runCondition: this.runCondition,
            queryFailureCondition: this.queryFailureCondition,
            successEvent: this.successEvent,
            failureEvent: this.failureEvent,

            data: this.data,
            error: this.error,
        };
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Partial<IJavascriptQuery>) {
        if (content.successEvent)
            this.successEventInstances = this.eventSchemaToFunc(content.successEvent);

        if (content.failureEvent)
            this.failureEventInstances = this.eventSchemaToFunc(content.failureEvent);

        Object.assign(this, content);

        if (content.runWhenPageLoads)
            this.trigger();
    }

    timeoutPromise(timeout: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({
                    type: 'TIMEOUT',
                    msg: '请求超时',
                });
            }, timeout);
        });
    }

    genQueryFn(ctx: Record<string, any>) {
        if (this.resourceType === ResourceType.RESTQuery && this.api) {
            // eslint-disable-next-line no-new-func
            const fn = new Function('_ctx', 'params', `
                    let result;
                    with(_ctx) {
                        result = letgoRequest(...params)
                    }
                    return result;
                `);
            return () => {
                const params = [executeExpression(this.api, ctx, true), executeExpression(this.params, ctx), {
                    method: this.method,
                }];
                return fn(ctx, params);
            };
        }
        else if (this.query) {
            // eslint-disable-next-line no-new-func
            return new Function('_ctx', `
                        let result;
                        with(_ctx) {
                            result = (async () => {
                                ${this.query}
                            })();
                        }
                        return result;
                    `);
        }
    }

    async trigger() {
        if (this.enableCaching && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration * 1000)
            return;
        const fn = this.genQueryFn(this.ctx);
        if (fn) {
            try {
                if (this.queryTimeout)
                    this.data = await Promise.race([this.timeoutPromise(this.queryTimeout), fn(this.ctx)]);
                else
                    this.data = await fn(this.ctx);

                this.cacheTime = Date.now();
                this.successEventInstances.forEach((eventHandler) => {
                    eventHandler();
                });
            }
            catch (err) {
                this.failureEventInstances.forEach((eventHandler) => {
                    eventHandler();
                });
                if (err instanceof Error)
                    this.error = err.message;
            }
        }
    }

    clearCache() {
        this.cacheTime = null;
    }

    reset() {
        this.clearCache();
        this.data = null;
        this.error = null;
    }
}
