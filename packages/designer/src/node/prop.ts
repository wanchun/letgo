import type {
    IPublicModelProp,
    IPublicTypeCompositeValue,
    IPublicTypeJSSlot,
    IPublicTypeSlotSchema,
} from '@webank/letgo-types';
import {
    GlobalEvent,
    IPublicEnumTransformStage,
    isJSExpression,
    isJSFunction,
    isJSSlot,
    isSlotSchema,
} from '@webank/letgo-types';
import { markComputed, markShallowReactive, uniqueId, valueToSource } from '@webank/letgo-common';
import { isNil, isPlainObject } from 'lodash-es';
import type { INode, ISlotNode } from '../types';
import type { Props } from './props';

export interface IPropParent {
    delete(prop: Prop): void
    readonly props: Props
    readonly owner: INode
    readonly path: string[]
}

type IValueTypes =
    | 'unset'
    | 'literal'
    | 'map'
    | 'list'
    | 'expression'
    | 'function'
    | 'slot';

export class Prop implements IPropParent, IPublicModelProp<INode> {
    private _key: string | number;

    private _value: any;

    private _type: IValueTypes;

    private _items: Prop[] | null;

    private _slotNode?: ISlotNode;

    private purged = false;

    readonly isProp = true;

    readonly id = uniqueId('prop$');

    readonly owner: INode;

    readonly props: Props;

    readonly options: any;

    spread: boolean;

    get key() {
        return this._key;
    }

    get path(): string[] {
        return (this.parent.path || []).concat(this.key as string);
    }

    /**
     * 属性类型
     */
    get type(): IValueTypes {
        return this._type;
    }

    get value() {
        return this.getValue();
    }

    get items(): Prop[] | null {
        return this._items;
    }

    get maps(): Map<string | number, Prop> | null {
        if (!this.items)
            return null;

        const maps: Map<string | number, Prop> = new Map();
        if (this.items.length > 0) {
            this.items.forEach((prop) => {
                if (!isNil(prop.key) && prop.key !== '')
                    maps.set(prop.key, prop);
            });
        }
        return maps;
    }

    get slotNode() {
        return this._slotNode;
    }

    /**
     * 元素个数
     */
    get size(): number {
        return this.items?.length || 0;
    }

    constructor(
        public parent: IPropParent,
        value: IPublicTypeCompositeValue | undefined,
        key: string | number,
        spread = false,
        options = {},
    ) {
        markShallowReactive(this, {
            _value: undefined,
            _type: 'unset',
            _items: null,
        });
        markComputed(this, ['key', 'type', 'value', 'items', 'maps', 'size']);
        this.owner = parent.owner;
        this.props = parent.props;
        this._key = key;
        this.spread = spread;
        this.options = options;
        if (!isNil(value))
            this.setValue(value);

        this.setupItems();
    }

    setKey(key: string | number) {
        this._key = key;
    }

    setupItems() {
        let items: Prop[] | null = null;
        const data = this._value;
        const type = this._type;
        if (type === 'list') {
            data.forEach((item: any, idx: number) => {
                items = items || [];
                items.push(new Prop(this, item, idx));
            });
        }
        else if (type === 'map') {
            const keys = Object.keys(data);
            for (const key of keys) {
                const prop = new Prop(this, data[key], key);
                items = items || [];
                items.push(prop);
            }
        }
        else {
            items = null;
        }
        this._items = items;
    }

    export(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): IPublicTypeCompositeValue {
        const type = this._type;

        if (type === 'unset')
            return undefined;

        if (type === 'literal' || type === 'expression')
            return this._value;

        if (type === 'slot') {
            const schema = this._slotNode?.exportSchema(stage);
            if (stage === IPublicEnumTransformStage.Render) {
                return {
                    type: 'JSSlot',
                    name: schema.name,
                    title: schema.title,
                    params: schema.props.params,
                    value: schema,
                };
            }
            return {
                type: 'JSSlot',
                name: schema.name,
                title: schema.title,
                params: schema.props.params,
                value: schema.children,
            };
        }
        if (type === 'map') {
            if (!this.items)
                return this._value;

            let maps: any;
            this.items.forEach((prop, index) => {
                if (!prop.isUnset()) {
                    const v = prop.export(stage);
                    if (v != null) {
                        maps = maps || {};
                        maps[prop.key ?? index] = v;
                    }
                }
            });
            return maps;
        }
        if (type === 'list') {
            if (!this.items)
                return this._value;

            const values = this.items.map((prop) => {
                return prop.export(stage);
            });
            if (values.every(val => val === undefined))
                return undefined;

            return values;
        }

        return this._value;
    }

    setAsSlot(data: IPublicTypeJSSlot) {
        this._type = 'slot';
        let slotSchema: IPublicTypeSlotSchema;
        // 当 data.value 的结构为 { componentName: 'Slot' } 时，直接当成 slotSchema 使用
        if (
            isSlotSchema(data.value)
        ) {
            slotSchema = data.value;
        }
        else {
            slotSchema = {
                componentName: 'Slot',
                name: data.name,
                title: data.title,
                props: {
                    params: data.params,
                },
                children: data.value,
            };
        }

        if (this._slotNode) {
            this._slotNode.importSchema(slotSchema);
        }
        else {
            const owner = this.owner;
            this._slotNode = owner.document.createNode(slotSchema);
            owner.addSlot(this._slotNode);
            this._slotNode.internalSetSlotFor(this);
        }
    }

    getValue(): IPublicTypeCompositeValue {
        return this.export(IPublicEnumTransformStage.Serialize);
    }

    getAsString(): string {
        if (this.type === 'literal')
            return this._value ? String(this._value) : '';

        return '';
    }

    setValue(val: IPublicTypeCompositeValue) {
        if (val === this._value)
            return;
        const editor = this.owner.document?.designer.editor;
        const oldValue = this._value;
        this._value = val;
        this._code = null;
        const t = typeof val;
        if (val == null) {
            this._type = 'literal';
        }
        else if (t === 'string' || t === 'number' || t === 'boolean') {
            this._type = 'literal';
        }
        else if (Array.isArray(val)) {
            this._type = 'list';
        }
        else if (isPlainObject(val)) {
            if (isJSSlot(val))
                this.setAsSlot(val);

            else if (isJSExpression(val))
                this._type = 'expression';

            else if (isJSFunction(val))
                this._type = 'function';

            else this._type = 'map';
        }
        else {
            this._type = 'expression';
            this._value = {
                type: 'JSExpression',
                value: valueToSource(val),
            };
        }

        this.dispose();
        this.setupItems();

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

    private _code: string | null = null;

    /**
     * 获得表达式值
     */
    get code() {
        if (isJSExpression(this.value))
            return this.value.value;

        if (this.type === 'slot')
            return JSON.stringify(this._slotNode.exportSchema(IPublicEnumTransformStage.Save));

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
        }
        catch (e) {
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
        const type = this._type;
        if (
            type !== 'map'
                && type !== 'list'
                && type !== 'unset'
                && !createIfNone
        )
            return null;

        const maps = type === 'map' ? this.maps : null;
        const items = type === 'list' ? this.items : null;

        let entry = path;
        let nest = '';
        if (typeof path !== 'number') {
            const i = path.indexOf('.');
            if (i > 0) {
                nest = path.slice(i + 1);
                if (nest)
                    entry = path.slice(0, i);
            }
        }

        let prop: any;
        if (type === 'list') {
            if (isValidArrayIndex(entry, this.size))
                prop = items[entry];
        }
        else if (type === 'map') {
            prop = maps?.get(entry);
        }

        if (prop)
            return nest ? prop.get(nest, createIfNone) : prop;

        if (createIfNone) {
            prop = new Prop(this, undefined, entry);
            this.set(entry, prop, true);
            if (nest)
                return prop.get(nest, true);

            return prop;
        }

        return null;
    }

    /**
     * 设置值到字典
     * @param force 强制
     */
    set(key: string | number, value: IPublicTypeCompositeValue | Prop, force = false) {
        const type = this._type;
        if (type !== 'map' && type !== 'list' && type !== 'unset' && !force)
            return null;

        if (type === 'unset' || (force && type !== 'map')) {
            if (isValidArrayIndex(key)) {
                if (type !== 'list')
                    this.setValue([]);
            }
            else {
                this.setValue({});
            }
        }

        const prop = isProp(value) ? value : new Prop(this, value, key);
        const items = [...(this._items || [])];
        if (this.type === 'list') {
            if (!isValidArrayIndex(key))
                return null;

            items[key] = prop;
        }
        else if (this.type === 'map') {
            const maps = this.maps || new Map<string, Prop>();
            const orig = maps?.get(key);
            if (orig) {
                // replace
                const i = items.indexOf(orig);
                if (i > -1)
                    items.splice(i, 1, prop)[0].purge();
            }
            else {
                // push
                items.push(prop);
            }
        }
        else {
            return null;
        }

        this._items = items;

        return prop;
    }

    /**
     * @returns  0: the same 1: maybe & like 2: not the same
     */
    compare(other: Prop | null): number {
        if (!other || other.isUnset())
            return this.isUnset() ? 0 : 2;

        if (other.type !== this.type)
            return 2;

        // list
        if (this.type === 'list')
            return this.size === other.size ? 1 : 2;

        if (this.type === 'map')
            return 1;

        // 'literal' | 'map' | 'expression' | 'slot'
        return this.code === other.code ? 0 : 2;
    }

    /**
     * 删除项
     */
    delete(prop: Prop): void {
        if (!this._items)
            return;

        const oldValue = this.getValue();

        const i = this._items.indexOf(prop);
        if (i > -1) {
            this._items.splice(i, 1);
            prop.purge();
        }

        const newValue = this.getValue();
        if (oldValue !== newValue) {
            const propsInfo = {
                key: this.key,
                prop: this,
                oldValue,
                newValue,
            };
            this.owner?.emitPropChange?.(propsInfo);
        }
    }

    /**
     * 从父级移除本身
     */
    remove() {
        this.parent.delete(this);
    }

    /**
     * 重置
     */
    unset() {
        this._type = undefined;
        this._value = undefined;
    }

    /**
     * 是否为重置状态
     */
    isUnset() {
        return this._type === undefined;
    }

    private dispose() {
        const items = this._items;
        if (items)
            items.forEach(prop => prop.purge());

        this._items = null;
        if (this._type !== 'slot' && this._slotNode) {
            this._slotNode.remove();
            this._slotNode = undefined;
        }
    }

    /**
     * 销毁
     */
    purge() {
        if (this.purged)
            return;

        this.purged = true;
        this.dispose();
    }
}

export function isProp(obj: any): obj is Prop {
    return obj && obj.isProp;
}

export function isValidArrayIndex(key: any, limit = -1): key is number {
    const n = Number.parseFloat(String(key));
    return (
        n >= 0 && Math.floor(n) === n && Number.isFinite(n) && (limit < 0 || n < limit)
    );
}
