import { isNil } from 'lodash-es';
import { hasExpression, replaceExpression } from '../../helper';
import { attachContext } from './transform-expression';

// 解析执行
// TODO 监听 dependency state 的变更,重新执行代码
export class TemporaryStateImpl {
    id: string;
    value: any;
    constructor(id: string, initValue: string) {
        this.id = id;

        this.value = this.executeInput(initValue);
    }

    executeInput(text?: string) {
        if (isNil(text))
            return null;
        if (hasExpression(text)) {
            // TODO new Function 实现代码解析之行能力
            const codeStr = replaceExpression(text, (_, expression) => {
                // TODO 只对已有状态和函数加 ctx;
                return `\${${attachContext(expression, () => true)}}`;
            });
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
