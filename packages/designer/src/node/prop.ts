import {
    CompositeValue,
    isJSSlot,
    isJSFunction,
    isJSExpression,
    GlobalEvent,
    TransformStage,
} from '@webank/letgo-types';
import { uniqueId } from '@webank/letgo-utils';
import { computed, shallowRef, ShallowRef, ComputedRef } from 'vue';
import { isPlainObject } from 'lodash-es';
import { Node } from './node';
import { Props } from './props';
import { valueToSource } from './value-to-source';

export const UNSET = Symbol.for('unset');
export type UNSET = typeof UNSET;

export type ValueTypes =
    | 'unset'
    | 'literal'
    | 'map'
    | 'list'
    | 'expression'
    | 'function'
    | 'slot';

export class Prop {
    readonly isProp = true;

    readonly id = uniqueId('prop$');

    readonly owner: Node;

    readonly props: Props;

    private _value: ShallowRef<any> = shallowRef(UNSET);

    private _type: ShallowRef<ValueTypes> = shallowRef('unset');

    private purged = false;

    key: string | number;

    /**
     * 属性类型
     */
    get type(): ValueTypes {
        return this._type.value;
    }

    get value() {
        return this.getValue();
    }

    /**
     * 属性值【响应性】
     */
    ComputedValue: ComputedRef<CompositeValue | UNSET> = computed(() => {
        return this.getValue();
    });

    constructor(
        parent: Props,
        value: CompositeValue | UNSET = UNSET,
        key: string | number,
    ) {
        this.owner = parent.owner;
        this.props = parent;
        this.key = key;
        if (value !== UNSET) {
            this.setValue(value);
        }
    }

    export(stage: TransformStage = TransformStage.Save): CompositeValue {
        const type = this._type.value;
        if (stage === TransformStage.Render) {
            return this._value.value;
        }

        if (type === 'unset') {
            return undefined;
        }

        if (type === 'slot') {
            // TODO
        }

        return this._value.value;
    }

    setValue(val: CompositeValue) {
        if (val === this._value.value) return;
        const editor = this.owner.document?.designer.editor;
        const oldValue = this._value.value;
        this._value.value = val;
        const t = typeof val;
        if (val == null) {
            this._type.value = 'literal';
        } else if (t === 'string' || t === 'number' || t === 'boolean') {
            this._type.value = 'literal';
        } else if (Array.isArray(val)) {
            this._type.value = 'list';
        } else if (isPlainObject(val)) {
            if (isJSSlot(val)) {
                // TODO
            } else if (isJSExpression(val)) {
                this._type.value = 'expression';
            } else if (isJSFunction(val)) {
                this._type.value = 'function';
            } else {
                this._type.value = 'map';
            }
        } else {
            this._type.value = 'expression';
            this._value.value = {
                type: 'JSExpression',
                value: valueToSource(val),
            };
        }

        if (oldValue !== this._value.value) {
            const propsInfo = {
                key: this.key,
                prop: this,
                oldValue,
                newValue: this._value.value,
            };

            editor?.emit(GlobalEvent.Node.Prop.InnerChange, {
                node: this.owner as any,
                ...propsInfo,
            });

            this.owner?.emitPropChange?.(propsInfo);
        }
    }

    getValue(): CompositeValue {
        return this.export(TransformStage.Serialize);
    }

    getAsString(): string {
        if (this.type === 'literal') {
            return this._value.value ? String(this._value.value) : '';
        }
        return '';
    }

    private _code: string | null = null;

    /**
     * 获得表达式值
     */
    get code() {
        if (isJSExpression(this.value)) {
            return this.value.value;
        }
        return this._code != null ? this._code : JSON.stringify(this.value);
    }

    /**
     * 设置表达式值
     */
    set code(code: string) {
        if (isJSExpression(this._value)) {
            this.setValue({
                ...this._value,
                value: code,
            });
            this._code = code;
            return;
        }

        try {
            const v = JSON.parse(code);
            this.setValue(v);
            this._code = code;
            return;
        } catch (e) {
            // ignore
        }

        this.setValue({
            type: 'JSExpression',
            value: code,
            mock: this._value,
        });
        this._code = code;
    }

    /**
     * @returns  0: the same 1: maybe & like 2: not the same
     */
    compare(other: Prop | null): number {
        if (!other || other.isUnset()) {
            return this.isUnset() ? 0 : 2;
        }
        if (other.type !== this.type) {
            return 2;
        }
        // list
        if (this.type === 'list') {
            return this.value.length === other.value.length ? 1 : 2;
        }
        if (this.type === 'map') {
            return 1;
        }

        // 'literal' | 'map' | 'expression' | 'slot'
        return this.code === other.code ? 0 : 2;
    }

    /**
     * 重置
     */
    unset() {
        this._type.value = 'unset';
    }

    /**
     * 是否为重置状态
     */
    isUnset() {
        return this._type.value === 'unset';
    }

    /**
     * 从父级移除本身
     */
    remove() {
        this.props.delete(this);
    }

    /**
     * 销毁
     */
    purge() {
        if (this.purged) {
            return;
        }
        this.purged = true;
        // TODO 其他的销毁
    }
}
