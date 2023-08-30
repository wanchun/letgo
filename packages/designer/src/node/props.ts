import { replaceExpressionIdentifier, replaceJSFunctionIdentifier, uniqueId } from '@harrywan/letgo-common';
import type {
    IPublicTypeCompositeValue,
    IPublicTypeEventHandler,
    IPublicTypePropsList,
    IPublicTypePropsMap,
} from '@harrywan/letgo-types';
import {
    IPublicEnumTransformStage, isJSExpression, isJSFunction,
} from '@harrywan/letgo-types';
import type { ShallowRef } from 'vue';
import { shallowRef, triggerRef } from 'vue';
import type { INode } from '../types';
import type { IPropParent } from './prop';
import { Prop } from './prop';

interface ExtrasObject {
    [key: string]: any
}

export const EXTRA_KEY_PREFIX = '___';

export function getConvertedExtraKey(key: string): string {
    if (!key)
        return '';

    let _key = key;
    if (key.indexOf('.') > 0)
        _key = key.split('.')[0];

    return EXTRA_KEY_PREFIX + _key + EXTRA_KEY_PREFIX + key.slice(_key.length);
}

export function getOriginalExtraKey(key: string): string {
    return key.replace(new RegExp(`${EXTRA_KEY_PREFIX}`, 'g'), '');
}

export class Props implements IPropParent {
    readonly id = uniqueId('props');

    /**
     * 响应式
     */
    private items: ShallowRef<Prop[]> = shallowRef([]);

    private itemMap: Map<string | number, Prop> = new Map();

    private purged = false;

    private _type: 'map' | 'list' = 'map';

    readonly owner: INode;

    readonly path: string[] = [];

    get props(): Props {
        return this;
    }

    get type() {
        return this._type;
    }

    constructor(
        owner: INode,
        value?: IPublicTypePropsMap | IPublicTypePropsList | null,
        extras?: ExtrasObject,
    ) {
        this.owner = owner;
        if (Array.isArray(value)) {
            this._type = 'list';
            value.forEach((item) => {
                this.add(item.name, item.value);
            });
        }
        else if (value != null) {
            this._type = 'map';
            Object.keys(value).forEach((key) => {
                this.add(key, value[key]);
            });
        }
        if (extras) {
            Object.keys(extras).forEach((key) => {
                this.add(getConvertedExtraKey(key), extras[key]);
            });
        }

        this.owner.onCodeIdChanged(this.scopeVariableChanged);
        this.owner.onNodeRefChanged(this.scopeVariableChanged);
    }

    scopeVariableChanged = (id: string, preId: string) => {
        this.items.value.forEach((item) => {
            const value = item.getValue();
            if (typeof item.key === 'string' && value) {
                if (item.key === getConvertedExtraKey('events')) {
                    const newValue = (value as []).map((item: IPublicTypeEventHandler) => {
                        if (item.namespace === preId)
                            item.namespace = id;

                        return item;
                    });
                    item.setValue(newValue as any);
                }
                else if (!item.key.startsWith('on')) {
                    if (isJSExpression(value)) {
                        item.setValue({
                            ...value,
                            value: replaceExpressionIdentifier(value.value, id, preId),
                        });
                    }
                    else if (isJSFunction(value)) {
                        let params = value.params;
                        if (params) {
                            params = params.map((param) => {
                                return replaceJSFunctionIdentifier(param, id, preId);
                            });
                        }
                        item.setValue({
                            ...value,
                            value: replaceJSFunctionIdentifier(value.value, id, preId),
                            params,
                        });
                    }
                }
            }
        });
    };

    import(value?: IPublicTypePropsMap | IPublicTypePropsList | null, extras?: ExtrasObject) {
        this.items.value.forEach(item => item.purge());
        this.itemMap.clear();
        this.items.value = [];
        if (Array.isArray(value)) {
            this._type = 'list';
            value.forEach((item) => {
                this.add(item.name, item.value);
            });
        }
        else if (value != null) {
            this._type = 'map';
            Object.keys(value).forEach((key) => {
                this.add(key, value[key]);
            });
        }
        else {
            this._type = 'map';
        }

        if (extras) {
            Object.keys(extras).forEach((key) => {
                this.add(getConvertedExtraKey(key), extras[key]);
            });
        }
    }

    export(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): {
        props?: IPublicTypePropsMap | IPublicTypePropsList
        extras?: ExtrasObject
    } {
        if (this.items.value.length < 1)
            return {};

        let props: any = {};
        const extras: any = {};
        if (this._type === 'list') {
            props = [];
            this.items.value.forEach((item) => {
                const value = item.export(stage);
                let name = item.key as string;
                if (
                    name
                    && typeof name === 'string'
                    && name.startsWith(EXTRA_KEY_PREFIX)
                ) {
                    name = getOriginalExtraKey(name);
                    extras[name] = value;
                }
                else {
                    props.push({
                        name,
                        value,
                    });
                }
            });
        }
        else {
            this.items.value.forEach((item) => {
                const value = item.export(stage);
                let name = item.key as string;
                if (name == null || item.isUnset())
                    return;
                if (
                    typeof name === 'string'
                    && name.startsWith(EXTRA_KEY_PREFIX)
                ) {
                    name = getOriginalExtraKey(name);
                    extras[name] = value;
                }
                else {
                    props[name] = value;
                }
            });
        }

        return { props, extras };
    }

    merge(value: IPublicTypePropsMap, extras?: IPublicTypePropsMap) {
        Object.keys(value).forEach((key) => {
            this.getProp(key).setValue(value[key]);
        });
        if (extras) {
            Object.keys(extras).forEach((key) => {
                this.getProp(getConvertedExtraKey(key)).setValue(extras[key]);
            });
        }
    }

    /**
     * 根据 path 路径查询属性
     * @param createIfNone 当没有的时候，是否创建一个
     */
    getProp(path: string, createIfNone = true): Prop | null {
        let entry = path;
        let nest = '';
        const i = path.indexOf('.');
        if (i > 0) {
            nest = path.slice(i + 1);
            if (nest)
                entry = path.slice(0, i);
        }

        let prop = this.itemMap.get(entry);
        if (!prop && createIfNone)
            prop = this.add(entry, undefined);

        if (prop)
            return nest ? prop.get(nest, createIfNone) : prop;

        return null;
    }

    getExtraProp(path: string, createIfNone = true): Prop | null {
        return this.getProp(getConvertedExtraKey(path), createIfNone);
    }

    has(key: string): boolean {
        return this.itemMap.has(key);
    }

    hasExtra(key: string): boolean {
        return this.itemMap.has(getConvertedExtraKey(key));
    }

    add(key: string | number, value: IPublicTypeCompositeValue | undefined): Prop {
        const prop = new Prop(this, value, key);
        this.items.value.push(prop);
        this.itemMap.set(prop.key, prop);
        triggerRef(this.items);
        return prop;
    }

    addExtra(key: string | number, value: IPublicTypeCompositeValue | undefined): Prop {
        return this.add(getConvertedExtraKey(String(key)), value);
    }

    delete(prop: Prop): void {
        const i = this.items.value.indexOf(prop);
        if (i > -1) {
            this.items.value.splice(i, 1);
            this.itemMap.delete(prop.key);
            triggerRef(this.items);
            prop.purge();
        }
    }

    changePropKey(oldKey: number | string, newKey: number | string, prop: Prop) {
        this.itemMap.delete(oldKey);
        this.itemMap.set(newKey, prop);
    }

    purge() {
        if (this.purged)
            return;

        this.purged = true;
        this.items.value.forEach(item => item.purge());
        this.itemMap.clear();
        this.items.value = [];
    }
}
