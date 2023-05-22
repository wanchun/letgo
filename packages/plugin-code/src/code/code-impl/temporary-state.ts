import { isNil } from 'lodash-es';
import { hasExpression, replaceExpression } from '../../helper';
import type { TemporaryState } from '../../interface';
import { attachContext } from './transform-expression';

// 解析执行
// TODO 监听 dependency state 的变更,重新执行代码
export class TemporaryStateImpl {
    id: string;
    deps: string[];
    ctx: Record<string, any>;
    value: any;
    constructor(data: TemporaryState, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.deps = deps;
        this.ctx = ctx;

        this.value = this.executeInput(data.initValue);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        if (hasExpression(text)) {
            // TODO new Function 实现代码解析之行能力
            const codeStr = replaceExpression(text, (_, expression) => {
                return `\${${attachContext(expression, name => this.deps.includes(name))}}`;
            });
            // eslint-disable-next-line no-new-func
            const fn = new Function('_ctx', `return \`${codeStr}\``);
            return fn(this.ctx);
        }
        else {
            try {
                return JSON.parse(text);
            }
            catch (_) {
                return text;
            }
        }
    }

    getState() {
        return {
            id: this.id,
            value: this.value,
        };
    }

    setValue(value: any) {
        this.value = value;
    }
}
