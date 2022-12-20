import {
    CompositeValue,
    isJSSlot,
    isJSFunction,
    isJSExpression,
    GlobalEvent,
    TransformStage,
} from '@webank/letgo-types';
import { uniqueId } from '@webank/letgo-utils';
import { computed, shallowRef, ShallowRef, ComputedRef, triggerRef } from 'vue';
import { isPlainObject } from 'lodash-es';
import { Node } from './node';
import { Props } from './props';
import { valueToSource } from './value-to-source';

export const UNSET = Symbol.for('unset');
export type UNSET = typeof UNSET;

export interface IPropParent {
    delete(prop: Prop): void;
    readonly props: Props;
    readonly owner: Node;
    readonly path: string[];
}

export type ValueTypes =
    | 'unset'
    | 'literal'
    | 'map'
    | 'list'
    | 'expression'
    | 'function'
    | 'slot';

export class Prop implements IPropParent {
    readonly isProp = true;

    readonly id = uniqueId('prop$');

    readonly owner: Node;

    readonly props: Props;

    readonly options: any;

    private _value: ShallowRef<any> = shallowRef(UNSET);

    private _type: ShallowRef<ValueTypes> = shallowRef('unset');

    private _items: ShallowRef<Prop[] | null> = shallowRef(null);

    private purged = false;

    private _maps: Map<string | number, Prop> | null = null;

    key: string | number;

    spread: boolean;

    get path(): string[] {
        return (this.parent.path || []).concat(this.key as string);
    }

    /**
     * 属性类型
     */
    get type(): ValueTypes {
        return this._type.value;
    }

    get value() {
        return this.getValue();
    }

    get items(): Prop[] | null {
        return this._items.value;
    }

    get maps(): Map<string | number, Prop> | null {
        if (!this.items) {
            return null;
        }
        return this._maps;
    }

    /**
     * 元素个数
     */
    get size(): number {
        return this.items?.length || 0;
    }

    /**
     * 属性值【响应性】
     */
    ComputedValue: ComputedRef<CompositeValue | UNSET> = computed(() => {
        return this.getValue();
    });

    constructor(
        public parent: IPropParent,
        value: CompositeValue | UNSET = UNSET,
        key: string | number,
        spread = false,
        options = {},
    ) {
        this.owner = parent.owner;
        this.props = parent.props;
        this.key = key;
        this.spread = spread;
        this.options = options;
        if (value !== UNSET) {
            this.setValue(value);
        }
        this.setupItems();
    }

    setupItems() {
        let items: Prop[] | null = null;
        const data = this._value.value;
        const type = this._type.value;
        if (type === 'list') {
            data.forEach((item: any, idx: number) => {
                items = items || [];
                items.push(new Prop(this, item, idx));
            });
            this._maps = null;
        } else if (type === 'map') {
            const maps = new Map<string, Prop>();
            const keys = Object.keys(data);
            for (const key of keys) {
                const prop = new Prop(this, data[key], key);
                items = items || [];
                items.push(prop);
                maps.set(key, prop);
            }
            this._maps = maps;
        } else {
            items = null;
            this._maps = null;
        }
        this._items.value = items;
    }

    export(stage: TransformStage = TransformStage.Save): CompositeValue {
        const type = this._type.value;

        if (type === 'unset') {
            return undefined;
        }
        if (type === 'literal' || type === 'expression') {
            return this._value.value;
        }
        if (type === 'map') {
            if (!this._items.value) {
                return this._value.value;
            }
            let maps: any;
            this.items.forEach((prop, key) => {
                if (!prop.isUnset()) {
                    const v = prop.export(stage);
                    if (v != null) {
                        maps = maps || {};
                        maps[prop.key || key] = v;
                    }
                }
            });
            return maps;
        }
        if (type === 'list') {
            if (!this._items.value) {
                return this._value.value;
            }
            const values = this._items.value.map((prop) => {
                return prop.export(stage);
            });
            if (values.every((val) => val === undefined)) {
                return undefined;
            }
            return values;
        }

        return this._value.value;
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

        this.dispose();

        this.setupItems();

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

    private dispose() {
        const items = this._items.value;
        if (items) {
            items.forEach((prop) => prop.purge());
        }
        this._items.value = null;
        this._maps = null;
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
     * 获取某个属性
     * @param createIfNone 当没有的时候，是否创建一个
     */
    get(path: string | number, createIfNone = true): Prop | null {
        const type = this._type.value;
        if (
            type !== 'map' &&
            type !== 'list' &&
            type !== 'unset' &&
            !createIfNone
        ) {
            return null;
        }

        const maps = type === 'map' ? this.maps : null;
        const items = type === 'list' ? this.items : null;

        let entry = path;
        let nest = '';
        if (typeof path !== 'number') {
            const i = path.indexOf('.');
            if (i > 0) {
                nest = path.slice(i + 1);
                if (nest) {
                    entry = path.slice(0, i);
                }
            }
        }

        let prop: any;
        if (type === 'list') {
            if (isValidArrayIndex(entry, this.size)) {
                prop = items[entry];
            }
        } else if (type === 'map') {
            prop = maps?.get(entry);
        }

        if (prop) {
            return nest ? prop.get(nest, createIfNone) : prop;
        }

        if (createIfNone) {
            prop = new Prop(this, UNSET, entry);
            this.set(entry, prop, true);
            if (nest) {
                return prop.get(nest, true);
            }

            return prop;
        }

        return null;
    }

    /**
     * 设置值到字典
     * @param force 强制
     */
    set(key: string | number, value: CompositeValue | Prop, force = false) {
        const type = this._type.value;
        if (type !== 'map' && type !== 'list' && type !== 'unset' && !force) {
            return null;
        }
        if (type === 'unset' || (force && type !== 'map')) {
            if (isValidArrayIndex(key)) {
                if (type !== 'list') {
                    this.setValue([]);
                }
            } else {
                this.setValue({});
            }
        }
        const prop = isProp(value) ? value : new Prop(this, value, key);
        const items = this._items.value || [];
        if (this.type === 'list') {
            if (!isValidArrayIndex(key)) {
                return null;
            }
            items[key] = prop;
            this._items.value = items;
        } else if (this.type === 'map') {
            const maps = this._maps || new Map<string, Prop>();
            const orig = maps?.get(key);
            if (orig) {
                // replace
                const i = items.indexOf(orig);
                if (i > -1) {
                    items.splice(i, 1, prop)[0].purge();
                }
                maps?.set(key, prop);
            } else {
                // push
                items.push(prop);
                this._items.value = items;

                maps?.set(key, prop);
            }
            this._maps = maps;
        } /* istanbul ignore next */ else {
            return null;
        }

        triggerRef(this._items);

        return prop;
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
            return this.size === other.size ? 1 : 2;
        }
        if (this.type === 'map') {
            return 1;
        }

        // 'literal' | 'map' | 'expression' | 'slot'
        return this.code === other.code ? 0 : 2;
    }

    /**
     * 删除项
     */
    delete(prop: Prop): void {
        /* istanbul ignore else */
        if (this._items.value) {
            const i = this._items.value.indexOf(prop);
            if (i > -1) {
                this._items.value.splice(i, 1);
                triggerRef(this._items);
                prop.purge();
            }
            if (this._maps && prop.key) {
                this._maps.delete(String(prop.key));
            }
        }
    }

    /**
     * 删除 key
     */
    deleteKey(key: string): void {
        /* istanbul ignore else */
        if (this.maps) {
            const prop = this.maps.get(key);
            if (prop) {
                this.delete(prop);
            }
        }
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
        if (this._items.value) {
            this._items.value.forEach((item) => item.purge());
        }
        this._items.value = null;
        this._maps = null;
    }
}

export function isProp(obj: any): obj is Prop {
    return obj && obj.isProp;
}

export function isValidArrayIndex(key: any, limit = -1): key is number {
    const n = parseFloat(String(key));
    return (
        n >= 0 && Math.floor(n) === n && isFinite(n) && (limit < 0 || n < limit)
    );
}
