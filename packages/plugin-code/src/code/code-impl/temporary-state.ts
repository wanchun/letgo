import type { Ref } from 'vue';
import { ref } from 'vue';
import { isNil } from 'lodash-es';
import { hasExpression, replaceExpression } from '../../helper';
import { attachContext } from './transform-expression';

// 解析执行
export class TemporaryStateImpl {
    id: string;
    value: Ref<any>;
    constructor(id: string, initValue: string) {
        this.id = id;

        this.value = ref(this.executeInput(initValue));
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
        this.value.value = value;
    }
}
