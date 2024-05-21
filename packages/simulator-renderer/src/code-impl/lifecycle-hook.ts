import { markComputed, markShallowReactive } from '@webank/letgo-common';
import { LifecycleHookLive } from '@webank/letgo-renderer';
import type { ILifecycle } from '@webank/letgo-types';
import type { ILifecycleImpl } from '@webank/letgo-designer';

// 解析执行
export class LifecycleHookImpl extends LifecycleHookLive implements ILifecycleImpl {
    constructor(data: ILifecycle, deps: string[], ctx: Record<string, any>) {
        super(data, deps, ctx);
        markShallowReactive(this, {
            id: data.id,
            hookName: data.hookName,
            funcBody: data.funcBody,
        });
        markComputed(this, ['view']);
    }

    get view() {
        return {
            id: this.id,
            funcBody: this.funcBody,
            hookName: this.hookName,
        };
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Partial<ILifecycle>) {
        Object.assign(this, content);
    }
}
