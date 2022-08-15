import { uniqueId } from '@webank/letgo-utils';
import { PropsList, PropsMap, CompositeValue } from '@webank/letgo-types';
import { Node } from './node';
import { Prop, UNSET } from './prop';

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

    constructor(owner: Node, value?: PropsMap | PropsList | null) {
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
    }

    import(value?: PropsMap | PropsList | null) {
        const originItems = this.items;
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

        originItems.forEach((item) => item.purge());
    }

    merge(value: PropsMap) {
        Object.keys(value).forEach((key) => {
            this.getProp(key).setValue(value[key]);
        });
    }

    /**
     * 根据 name 路径查询属性
     * @param createIfNone 当没有的时候，是否创建一个
     */
    getProp(name: string, createIfNone = true): Prop | null {
        let prop = this.itemMap.get(name);
        if (!prop && createIfNone) {
            prop = this.add(UNSET, name);
        }

        if (prop) {
            return prop;
        }

        return null;
    }

    has(key: string): boolean {
        return this.itemMap.has(key);
    }

    add(value: CompositeValue | null | UNSET, key?: string | number): Prop {
        const prop = new Prop(this, value, key);
        this.items.push(prop);
        this.itemMap.set(prop.key, prop);
        return prop;
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
