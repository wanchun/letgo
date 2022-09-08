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
     * 属性类型【响应性】
     */
    get type(): ShallowRef<ValueTypes> {
        return this._type;
    }

    /**
     * 属性值【响应性】
     */
    value: ComputedRef<CompositeValue | UNSET> = computed(() => {
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
        if (this.type.value === 'literal') {
            return this._value.value ? String(this._value.value) : '';
        }
        return '';
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
