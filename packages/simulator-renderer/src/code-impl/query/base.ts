import { markComputed, markShallowReactive } from '@harrywan/letgo-common';
import type { IJavascriptQuery } from '@harrywan/letgo-types';
import { RunCondition } from '@harrywan/letgo-types';
import { JavascriptQueryBase } from '@harrywan/letgo-renderer';
import type { IJavascriptQueryImpl } from '@harrywan/letgo-designer';

// 解析执行
export class JavascriptQueryImpl extends JavascriptQueryBase implements IJavascriptQueryImpl {
    constructor(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        markShallowReactive(this, {
            id: data.id,

            enableTransformer: data.enableTransformer,
            transformer: data.transformer,

            query: data.query,
            enableCaching: false,
            cacheDuration: null,
            showFailureToaster: data.showFailureToaster || false,
            showSuccessToaster: data.showSuccessToaster || false,
            successMessage: data.successMessage || '',
            queryTimeout: data.queryTimeout,
            runCondition: data.runCondition || RunCondition.Manual,
            queryFailureCondition: data.queryFailureCondition || [],
            successEvent: data.successEvent,
            failureEvent: data.failureEvent,
        });
        markComputed(this, ['view']);
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

            loading: this.loading,
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
}
