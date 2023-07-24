import { isNil } from 'lodash-es';
import { attachContext } from '@harrywan/letgo-common';
import type { ITemporaryState } from '@harrywan/letgo-types';
import { CodeType } from '@harrywan/letgo-types';

// 解析执行
export class TemporaryStateLive {
    id: string;
    type: CodeType.TEMPORARY_STATE = CodeType.TEMPORARY_STATE;
    deps: string[];
    ctx: Record<string, any>;
    value: any = null;
    initValue: string;
    constructor(data: ITemporaryState, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.deps = deps || [];
        this.ctx = ctx;
        this.initValue = data.initValue;

        this.value = this.initValue ? this.executeInput(this.initValue) : null;
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
    }

    recalculateValue() {
        this.value = this.executeInput(this.initValue);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        try {
            const exp = attachContext(text, name => this.deps.includes(name));
            // eslint-disable-next-line no-new-func
            const fn = new Function('_ctx', `return ${exp}`);
            return fn(this.ctx);
        }
        catch (_) {
            return null;
        }
    }

    setValue(value: any) {
        this.value = value;
    }
}
