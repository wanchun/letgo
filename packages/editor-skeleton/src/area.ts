import { shallowRef, Ref } from 'vue';
import { IWidgetBaseConfig, IWidget, isPanel } from './types';
import { Skeleton } from './skeleton';

export interface WidgetItem {
    name: string;
}

export class Area<C extends IWidgetBaseConfig, T extends IWidget = IWidget> {
    private _items: Ref<T[]> = shallowRef([]);

    private _itemMaps: { [name: string]: T } = {};

    private _current: Ref<T | null> = shallowRef(null);

    handle: (config: C | T) => T;

    get items() {
        return this._items;
    }

    get current() {
        return this._current;
    }

    active(nameOrItem?: T | string | null) {
        let item: any = nameOrItem;
        if (nameOrItem && typeof nameOrItem === 'string') {
            item = this.get(nameOrItem);
        }
        if (!isPanel(item)) {
            item = null;
        }
        const currentItem = this._current.value;
        if (currentItem === item) {
            return;
        }
        if (currentItem) {
            currentItem.hide();
        }
        this._current.value = item;
        if (item) {
            item.show();
        }
    }

    unActive(nameOrItem?: T | string | null) {
        let item: any = nameOrItem;
        if (nameOrItem && typeof nameOrItem === 'string') {
            item = this.get(nameOrItem);
        }
        if (!isPanel(item)) {
            item = null;
        }
        if (this._current.value === item) {
            this._current.value = null;
        }
        if (item) {
            item.hide();
        }
    }

    unActiveAll() {
        Object.keys(this._itemMaps).forEach((name) => this.unActive(name));
    }

    constructor(
        readonly skeleton: Skeleton,
        readonly name: string,
        handle: (item: T | C) => T,
    ) {
        this.skeleton = skeleton;
        this.name = name;
        this.handle = handle;
    }

    isEmpty(): boolean {
        return this._items.value.length < 1;
    }

    add(config: T | C): T {
        const item = this.get(config.name);
        if (item) {
            return item;
        }
        const newItem = this.handle(config);
        this._items.value = [...this._items.value, newItem];
        this._itemMaps[config.name] = newItem;
        if (isPanel(newItem)) {
            newItem.setParent(this);
        }
        return newItem;
    }

    remove(item: string | T): number {
        const thing = typeof item === 'string' ? this.get(item) : item;
        if (!thing) {
            return -1;
        }
        const itemValues = this._items.value;
        const i = itemValues.indexOf(thing);
        if (i > -1) {
            this._items.value = itemValues.splice(i, 1);
        }
        delete this._itemMaps[thing.name];
        if (thing === this.current.value) {
            this._current.value = null;
        }
        return i;
    }

    get(name: string): T | null {
        return this._itemMaps[name] || null;
    }

    getAt(index: number): T | null {
        return this._items.value[index] || null;
    }

    indexOf(item: T): number {
        return this._items.value.indexOf(item);
    }
}
