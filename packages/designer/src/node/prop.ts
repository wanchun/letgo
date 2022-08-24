import {
    CompositeValue,
    isJSSlot,
    isJSFunction,
    isJSExpression,
    GlobalEvent,
    TransformStage,
} from '@webank/letgo-types';
import { uniqueId } from '@webank/letgo-utils';
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

    private _value: any = UNSET;

    private _type: ValueTypes = 'unset';

    private purged = false;

    key: string | number;

    /**
     * 属性类型
     */
    get type(): ValueTypes {
        return this._type;
    }

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
        const type = this._type;
        if (stage === TransformStage.Render) {
            return this._value;
        }

        if (type === 'unset') {
            return undefined;
        }

        if (type === 'slot') {
            // TODO
        }

        return this._value;
    }

    setValue(val: CompositeValue) {
        if (val === this._value) return;
        const editor = this.owner.document?.designer.editor;
        const oldValue = this._value;
        this._value = val;
        const t = typeof val;
        if (val == null) {
            this._type = 'literal';
        } else if (t === 'string' || t === 'number' || t === 'boolean') {
            this._type = 'literal';
        } else if (Array.isArray(val)) {
            this._type = 'list';
        } else if (isPlainObject(val)) {
            if (isJSSlot(val)) {
                // TODO
            } else if (isJSExpression(val)) {
                this._type = 'expression';
            } else if (isJSFunction(val)) {
                this._type = 'function';
            } else {
                this._type = 'map';
            }
        } else {
            this._type = 'expression';
            this._value = {
                type: 'JSExpression',
                value: valueToSource(val),
            };
        }

        if (oldValue !== this._value) {
            const propsInfo = {
                key: this.key,
                prop: this,
                oldValue,
                newValue: this._value,
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
            return this._value ? String(this._value) : '';
        }
        return '';
    }

    get value(): CompositeValue | UNSET {
        return this.getValue();
    }

    unset() {
        this._type = 'unset';
    }

    isUnset() {
        return this._type === 'unset';
    }

    /**
     * 从父级移除本身
     */
    remove() {
        this.props.delete(this);
    }

    purge() {
        if (this.purged) {
            return;
        }
        this.purged = true;
        // TODO 其他的销毁
    }
}
