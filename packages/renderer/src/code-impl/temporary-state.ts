import { isNil } from 'lodash-es';
import { hasExpression, markComputed, markReactive } from '@webank/letgo-common';
import type { ITemporaryState } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';
import type { ITemporaryStateImpl } from '@webank/letgo-designer';
import { attachContext, replaceExpression } from '../parse';

// 解析执行
export class TemporaryStateImpl implements ITemporaryStateImpl {
    id: string;
    type: CodeType.TEMPORARY_STATE = CodeType.TEMPORARY_STATE;
    deps: string[];
    ctx: Record<string, any>;
    value: any;
    initValue: string;
    constructor(data: ITemporaryState, deps: string[], ctx: Record<string, any>) {
        markReactive(this, {
            id: data.id,
            value: null,
        });
        markComputed(this, ['view']);
        this.deps = deps || [];
        this.ctx = ctx;
        this.initValue = data.initValue;

        this.value = this.executeInput(this.initValue);
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
    }

    get view() {
        return {
            id: this.id,
            value: this.value,
        };
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Record<string, any>) {
        if (content.initValue) {
            this.initValue = content.initValue;
            this.value = this.executeInput(content.initValue);
        }
    }

    recalculateValue() {
        this.value = this.executeInput(this.initValue);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        let result = text;
        try {
            if (hasExpression(text)) {
                result = replaceExpression(text, (_, expression) => {
                    const exp = attachContext(expression, name => this.deps.includes(name));
                    // eslint-disable-next-line no-new-func
                    const fn = new Function('_ctx', `return ${exp}`);
                    return fn(this.ctx);
                });
            }
            result = JSON.parse(result);
            return result;
        }
        catch (_) {
            return result;
        }
    }

    setValue(value: any) {
        console.log(this.id, value);
        this.value = value;
    }
}
