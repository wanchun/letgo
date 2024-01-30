import { markComputed, markShallowReactive } from '@webank/letgo-common';
import type { IBaseConfig, IBaseWidget } from './types';
import { isPanel } from './types';
import type { Skeleton } from './skeleton';

export class Area<C extends IBaseConfig, T extends IBaseWidget = IBaseWidget> {
    private _items: T[];

    private _current: T | null;

    private _itemMaps: { [name: string]: T } = {};

    handle: (config: C) => T;

    get items() {
        return this._items;
    }

    get current() {
        return this._current;
    }

    constructor(
        readonly skeleton: Skeleton,
        readonly name: string,
        handle: (item: C) => T,
    ) {
        markShallowReactive(this, {
            _items: [],
            _current: null,
        });
        markComputed(this, ['items', 'current']);

        this.skeleton = skeleton;
        this.name = name;
        this.handle = handle;
    }

    active(nameOrItem?: T | string | null) {
        let item: any = nameOrItem;
        if (nameOrItem && typeof nameOrItem === 'string')
            item = this.get(nameOrItem);

        if (!isPanel(item))
            item = null;

        const currentItem = this._current;
        if (currentItem === item)
            return;

        if (currentItem)
            currentItem.hide();

        this._current = item;
        if (item)
            item.show();
    }

    unActive(nameOrItem?: T | string | null) {
        let item: any = nameOrItem;
        if (nameOrItem && typeof nameOrItem === 'string')
            item = this.get(nameOrItem);

        if (!isPanel(item))
            item = null;

        if (this._current === item)
            this._current = null;

        if (item)
            item.hide();
    }

    unActiveAll() {
        Object.keys(this._itemMaps).forEach(name => this.unActive(name));
    }

    isEmpty(): boolean {
        return this._items.length < 1;
    }

    add(config: C): T {
        const item = this.get(config.name);
        if (item)
            return item;

        const newItem = this.handle(config);
        newItem.setParent(this);

        return newItem;
    }

    addItem(item: T) {
        const _item = this.get(item.name);
        if (_item)
            return;
        this._items = [...this._items, item];
        this._itemMaps[item.name] = item;
    }

    remove(item: string | T): number {
        const thing = typeof item === 'string' ? this.get(item) : item;
        if (!thing)
            return -1;

        const itemValues = [...this._items];
        const i = itemValues.indexOf(thing);
        if (i > -1) {
            itemValues.splice(i, 1);
            this._items = itemValues;
        }
        if (this._itemMaps[thing.name])
            delete this._itemMaps[thing.name];

        if (thing === this._current)
            this._current = null;

        return i;
    }

    get(name: string): T | null {
        return this._itemMaps[name] || null;
    }

    getAt(index: number): T | null {
        return this._items[index] || null;
    }

    indexOf(item: T): number {
        return this._items.indexOf(item);
    }
}
