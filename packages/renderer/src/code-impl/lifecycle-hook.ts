import type { ILifecycle, IPublicEnumPageLifecycle, IPublicEnumProjectLifecycle } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';

// 解析执行
export class LifecycleHookLive {
    id: string;
    type: IEnumCodeType.LIFECYCLE_HOOK = IEnumCodeType.LIFECYCLE_HOOK;
    funcBody: string;
    hookName: IPublicEnumPageLifecycle | IPublicEnumProjectLifecycle;
    ctx: Record<string, any>;
    deps: string[];

    constructor(data: ILifecycle, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.funcBody = data.funcBody;
        this.hookName = data.hookName as IPublicEnumPageLifecycle | IPublicEnumProjectLifecycle;
        this.ctx = ctx;
        this.deps = deps;
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
    }

    async run() {
        if (this.funcBody) {
            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function('_ctx', `
            let result;
            with(_ctx) {
                result = (async () => {
                    ${this.funcBody}
                })();
            }
            return result;
        `);
                return await fn(this.ctx);
            }
            catch (err) {
                console.warn(err);
            }
        }
    }
}
