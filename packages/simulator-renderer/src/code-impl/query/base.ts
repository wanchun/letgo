import type { IJavascriptQuery } from '@webank/letgo-types';
import { JavascriptQueryBase } from '@webank/letgo-renderer';
import { markComputed } from '@webank/letgo-common';

// 解析执行
export class JavascriptQueryImpl extends JavascriptQueryBase {
    constructor(data: IJavascriptQuery, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);

        markComputed(this, ['view']);
    }

    get view() {
        return {
            query: this.query,
            enableCaching: this.enableCaching,
            cacheDuration: this.cacheDuration,
            queryTimeout: this.queryTimeout,
            runCondition: this.runCondition,
            successEvent: this.successEvent,
            failureEvent: this.failureEvent,

            response: this.response,
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
            this.successEventInstances = this.eventSchemaToFunc(content.successEvent, 'successEvent');

        if (content.failureEvent)
            this.failureEventInstances = this.eventSchemaToFunc(content.failureEvent, 'failureEvent');

        Object.assign(this, content);

        if (content.runWhenPageLoads)
            this.trigger();
    }
}
