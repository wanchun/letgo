import { uniqueId } from '@webank/letgo-utils';
import {
    PropsList,
    PropsMap,
    CompositeValue,
    TransformStage,
} from '@webank/letgo-types';
import { Node } from './node';
import { Prop, UNSET } from './prop';

interface ExtrasObject {
    [key: string]: any;
}

export const EXTRA_KEY_PREFIX = '___';
export function getConvertedExtraKey(key: string): string {
    if (!key) {
        return '';
    }
    let _key = key;
    if (key.indexOf('.') > 0) {
        _key = key.split('.')[0];
    }
    return EXTRA_KEY_PREFIX + _key + EXTRA_KEY_PREFIX + key.slice(_key.length);
}
export function getOriginalExtraKey(key: string): string {
    return key.replace(new RegExp(`${EXTRA_KEY_PREFIX}`, 'g'), '');
}

export class Props {
    readonly id = uniqueId('props');

    private items: Prop[] = [];

    private itemMap: Map<string | number, Prop> = new Map();

    private purged = false;

    readonly owner: Node;

    type: 'map' | 'list' = 'map';

    /**
     * 元素个数
     */
    get size() {
        return this.items.length;
    }

    constructor(
        owner: Node,
        value?: PropsMap | PropsList | null,
        extras?: ExtrasObject,
    ) {
        this.owner = owner;
        if (Array.isArray(value)) {
            this.type = 'list';
            value.forEach((item) => {
                this.add(item.value, item.name);
            });
        } else if (value != null) {
            this.type = 'map';
            Object.keys(value).forEach((key) => {
                this.add(value[key], key);
            });
        }
        if (extras) {
            Object.keys(extras).forEach((key) => {
                this.add((extras as any)[key], getConvertedExtraKey(key));
            });
        }
    }

    import(value?: PropsMap | PropsList | null, extras?: ExtrasObject) {
        this.items.forEach((item) => item.purge());
        this.itemMap.clear();
        this.items = [];
        if (Array.isArray(value)) {
            this.type = 'list';
            value.forEach((item) => {
                this.add(item.value, item.name);
            });
        } else if (value != null) {
            this.type = 'map';
            Object.keys(value).forEach((key) => {
                this.add(value[key], key);
            });
        } else {
            this.type = 'map';
            this.items = [];
        }

        if (extras) {
            Object.keys(extras).forEach((key) => {
                this.add((extras as any)[key], getConvertedExtraKey(key));
            });
        }
    }

    export(stage: TransformStage = TransformStage.Save): {
        props?: PropsMap | PropsList;
        extras?: ExtrasObject;
    } {
        if (this.items.length < 1) {
            return {};
        }
        let props: any = {};
        const extras: any = {};
        if (this.type === 'list') {
            props = [];
            this.items.forEach((item) => {
                const value = item.export(stage);
                let name = item.key as string;
                if (
                    name &&
                    typeof name === 'string' &&
                    name.startsWith(EXTRA_KEY_PREFIX)
                ) {
                    name = getOriginalExtraKey(name);
                    extras[name] = value;
                } else {
                    props.push({
                        name,
                        value,
                    });
                }
            });
        } else {
            this.items.forEach((item) => {
                const value = item.export(stage);
                let name = item.key as string;
                if (name == null || item.isUnset()) return;
                if (
                    typeof name === 'string' &&
                    name.startsWith(EXTRA_KEY_PREFIX)
                ) {
                    name = getOriginalExtraKey(name);
                    extras[name] = value;
                } else {
                    props[name] = value;
                }
            });
        }

        return { props, extras };
    }

    merge(value: PropsMap, extras?: PropsMap) {
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
     * 根据 key 路径查询属性
     * @param createIfNone 当没有的时候，是否创建一个
     */
    getProp(key: string, createIfNone = true): Prop | null {
        let prop = this.itemMap.get(key);
        if (!prop && createIfNone) {
            prop = this.add(UNSET, key);
        }

        if (prop) {
            return prop;
        }

        return null;
    }

    getExtraProp(key: string, createIfNone = true): Prop | null {
        return this.getProp(getConvertedExtraKey(key), createIfNone);
    }

    has(key: string): boolean {
        return this.itemMap.has(key);
    }

    hasExtra(key: string): boolean {
        return this.itemMap.has(getConvertedExtraKey(key));
    }

    add(value: CompositeValue | null | UNSET, key?: string | number): Prop {
        const prop = new Prop(this, value, key);
        this.items.push(prop);
        this.itemMap.set(prop.key, prop);
        return prop;
    }

    addExtra(
        value: CompositeValue | null | UNSET,
        key?: string | number,
    ): Prop {
        return this.add(value, getConvertedExtraKey(String(key)));
    }

    delete(prop: Prop): void {
        const i = this.items.indexOf(prop);
        if (i > -1) {
            this.items.splice(i, 1);
            this.itemMap.delete(prop.key);
            prop.purge();
        }
    }

    getPropValue(path: string): any {
        return this.getProp(path, false)?.value;
    }

    setPropValue(path: string, value: any) {
        this.getProp(path).setValue(value);
    }

    purge() {
        if (this.purged) {
            return;
        }
        this.purged = true;
        this.items.forEach((item) => item.purge());
        this.itemMap.clear();
        this.items = [];
    }
}
