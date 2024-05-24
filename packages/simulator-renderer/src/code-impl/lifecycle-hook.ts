import { markShallowReactive } from '@webank/letgo-common';
import { LifecycleHookLive } from '@webank/letgo-renderer';
import type { ILifecycle } from '@webank/letgo-types';

// 解析执行
export class LifecycleHookImpl extends LifecycleHookLive {
    constructor(data: ILifecycle, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        markShallowReactive(this, {
            id: data.id,
            hookName: data.hookName,
            funcBody: data.funcBody,
        });
    }

    view: null;

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Partial<ILifecycle>) {
        Object.assign(this, content);
    }
}
