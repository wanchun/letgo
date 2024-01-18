import { eventHandlersToJsFunction, markShallowReactive } from '@webank/letgo-common';
import type { IEnumResourceType, IEventHandler, IFailureCondition, IJavascriptQuery } from '@webank/letgo-types';
import { IEnumCodeType, IEnumRunCondition } from '@webank/letgo-types';
import { funcSchemaToFunc } from '../../parse';

export class JavascriptQueryBase {
    id: string;
    resourceType: IEnumResourceType;
    type: IEnumCodeType.JAVASCRIPT_QUERY = IEnumCodeType.JAVASCRIPT_QUERY;
    ctx: Record<string, any>;
    data: any = null;
    response: any = null;
    error: string = null;
    loading = false;
    deps: string[];

    enableTransformer: boolean;
    transformer: string;

    showFailureToaster: boolean;
    showSuccessToaster: boolean;
    successMessage: string;
    queryTimeout: number;
    query: string;
    runWhenPageLoads = false;
    enableCaching = false;
    cacheDuration: number = null;
    runCondition: IEnumRunCondition;
    failureEvent: IEventHandler[];
    successEventInstances: ((...args: any[]) => void)[];
    failureEventInstances: ((...args: any[]) => void)[];
    successEvent: IEventHandler[];
    queryFailureCondition: IFailureCondition[];
    cacheTime: number;
    constructor(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;

        this.enableTransformer = data.enableTransformer;
        this.transformer = data.transformer;

        this.query = data.query;
        this.showFailureToaster = data.showFailureToaster || false;
        this.showSuccessToaster = data.showSuccessToaster || false;
        this.successMessage = data.successMessage || '';
        this.queryTimeout = data.queryTimeout;
        this.runCondition = data.runCondition || IEnumRunCondition.Manual;
        this.queryFailureCondition = data.queryFailureCondition || [];
        this.successEvent = data.successEvent;
        this.failureEvent = data.failureEvent;
        this.resourceType = data.resourceType;
        this.runWhenPageLoads = data.runWhenPageLoads;
        this.ctx = ctx;
        this.deps = deps;

        markShallowReactive(this, {
            data: null,
            error: null,
            loading: false,
        });

        this.successEventInstances = this.eventSchemaToFunc(this.successEvent);
        this.failureEventInstances = this.eventSchemaToFunc(this.failureEvent);
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
    }

    eventSchemaToFunc(events: IEventHandler[] = []) {
        if (!events.length)
            return [];
        const jsExpressionMap = eventHandlersToJsFunction(events);
        const jsExpressions = Object.keys(jsExpressionMap).reduce((acc, cur) => {
            acc = acc.concat(jsExpressionMap[cur]);
            return acc;
        }, []);
        return jsExpressions.map(item => funcSchemaToFunc(item, this.ctx));
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

    genQueryFn() {
        if (this.query) {
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

    trigger = async () => {
        if (this.enableCaching && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration * 1000)
            return;
        const fn = this.genQueryFn();
        if (fn) {
            try {
                this.loading = true;
                let response;
                if (this.queryTimeout)
                    response = await Promise.race([this.timeoutPromise(this.queryTimeout), fn(this.ctx)]);
                else
                    response = await fn(this.ctx);

                this.response = response;

                let data = response?.data;
                if (this.enableTransformer && this.transformer) {
                    // eslint-disable-next-line no-new-func
                    const fn = new Function('_ctx', `
                        let result;
                        with(_ctx) {
                            result = (async () => {
                                ${this.transformer}
                            })();
                        }
                        return result;
                    `);
                    data = await fn({
                        ...this.ctx,
                        data,
                    });
                }

                this.data = data;
                this.cacheTime = Date.now();
                this.successEventInstances.forEach((eventHandler) => {
                    eventHandler(this.data);
                });
                return this.data;
            }
            catch (err) {
                this.failureEventInstances.forEach((eventHandler) => {
                    eventHandler(err);
                });
                if (err instanceof Error)
                    this.error = err.message;
                else
                    this.error = err.toString();

                return Promise.reject(err);
            }
            finally {
                this.loading = false;
            }
        }
    };

    clearCache() {
        this.cacheTime = null;
    }

    reset() {
        this.clearCache();
        this.data = null;
        this.error = null;
    }
}
