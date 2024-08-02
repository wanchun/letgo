import { isPlainObject, set } from 'lodash-es';
import { LogIdType, markReactive } from '@webank/letgo-common';
import type { ITemporaryState } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { executeExpression } from '../parse';
import config from '../config';

// 解析执行
export class TemporaryStateLive {
    id: string;
    type: IEnumCodeType.TEMPORARY_STATE = IEnumCodeType.TEMPORARY_STATE;
    deps: string[];
    ctx: Record<string, any>;
    value: any = null;
    initValue: string;
    constructor(data: ITemporaryState, deps: string[], ctx: Record<string, any>) {
        this.id = data.id;
        this.deps = deps || [];
        this.ctx = ctx;
        this.initValue = data.initValue;

        markReactive(this, {
            value: this.initValue ? this.executeInput(this.initValue) : null,
        });
    }

    changeDeps(deps: string[]) {
        this.deps = deps;
    }

    recalculateValue() {
        this.value = this.executeInput(this.initValue);
    }

    executeInput(expression?: string) {
        try {
            return executeExpression(expression, this.ctx);
        }
        catch (err) {
            config.logError(err, {
                id: this.id,
                idType: LogIdType.CODE,
                content: expression,
            });
            return null;
        }
    }

    setIn(path: string | string[], value: any) {
        if (isPlainObject(this.value))
            set(this.value, path, value);
    }

    setValue(value: any) {
        this.value = value;
    }
}
