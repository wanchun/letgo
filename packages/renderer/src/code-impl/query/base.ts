import { eventHandlersToJsFunction } from '@harrywan/letgo-common';
import type { IFailureCondition, IJavascriptQuery, IPublicTypeEventHandler, ResourceType } from '@harrywan/letgo-types';
import { CodeType, RunCondition } from '@harrywan/letgo-types';
import { funcSchemaToFunc } from '../../parse';

export class JavascriptQueryBase {
    id: string;
    resourceType: ResourceType;
    type: CodeType.JAVASCRIPT_QUERY = CodeType.JAVASCRIPT_QUERY;
    ctx: Record<string, any>;
    data: any = null;
    error: string = null;
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
    runCondition: RunCondition;
    failureEvent: IPublicTypeEventHandler[];
    successEventInstances: ((...args: any[]) => void)[];
    failureEventInstances: ((...args: any[]) => void)[];
    successEvent: IPublicTypeEventHandler[];
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
        this.runCondition = data.runCondition || RunCondition.Manual;
        this.queryFailureCondition = data.queryFailureCondition || [];
        this.successEvent = data.successEvent;
        this.failureEvent = data.failureEvent;
        this.resourceType = data.resourceType;
        this.runWhenPageLoads = data.runWhenPageLoads;
        this.ctx = ctx;
        this.deps = deps;

        this.successEventInstances = this.eventSchemaToFunc(this.successEvent);
        this.failureEventInstances = this.eventSchemaToFunc(this.failureEvent);
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
                if (this.queryTimeout)
                    this.data = await Promise.race([this.timeoutPromise(this.queryTimeout), fn(this.ctx)]);
                else
                    this.data = await fn(this.ctx);

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
                    this.data = await fn({
                        ...this.ctx,
                        data: this.data,
                    });
                }

                this.cacheTime = Date.now();
                this.successEventInstances.forEach((eventHandler) => {
                    eventHandler(this.data);
                });
            }
            catch (err) {
                this.failureEventInstances.forEach((eventHandler) => {
                    eventHandler(err);
                });
                if (err instanceof Error)
                    this.error = err.message;
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
