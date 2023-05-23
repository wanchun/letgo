import { isNil } from 'lodash-es';
import { hasExpression, replaceExpression } from '../../helper';
import type { JavascriptComputed } from '../../interface';
import { attachContext } from './transform-expression';

// TODO 变量变更监听
export class ComputedImpl {
    id: string;
    deps: string[];
    ctx: Record<string, any>;
    value: any;
    funcBody: string;
    constructor(data: JavascriptComputed, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.deps = deps || [];
        this.ctx = ctx;
        this.funcBody = data.funcBody;

        this.value = this.executeInput(this.funcBody);
    }

    changeId(id: string) {
        this.id = id;
    }

    changeContent(content: Record<string, any>) {
        if (content.funcBody) {
            this.funcBody = content.funcBody;
            this.value = this.executeInput(content.funcBody);
        }
    }

    recalculateValue() {
        this.value = this.executeInput(this.funcBody);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        if (hasExpression(text)) {
            const codeStr = replaceExpression(text, (_, expression) => {
                return attachContext(expression, name => this.deps.includes(name));
            });
            // eslint-disable-next-line no-new-func
            const fn = new Function('_ctx', codeStr);
            return fn(this.ctx);
        }
        else {
            // eslint-disable-next-line no-new-func
            const fn = new Function(this.funcBody);
            return fn(this.ctx);
        }
    }

    getState() {
        return {
            id: this.id,
            value: this.value,
        };
    }
}
