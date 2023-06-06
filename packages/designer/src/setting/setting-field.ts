import type { IPublicTypeFieldConfig, IPublicTypeFieldExtraProps, IPublicTypeSetterType } from '@webank/letgo-types';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
import { SettingProp } from './setting-prop';
import type { ISettingEntry } from './types';

function getSettingFieldCollectorKey(
    parent: ISettingEntry,
    config: IPublicTypeFieldConfig,
) {
    const path = [config.name];
    let cur = parent;
    while (cur !== parent.top) {
        if (cur instanceof SettingField && cur.type !== 'group')
            path.unshift(cur.name);

        cur = cur.parent;
    }
    return path.join('.');
}

export class SettingField extends SettingProp implements ISettingEntry {
    readonly isSettingField = true;

    readonly isRequired: boolean;

    private _config: IPublicTypeFieldConfig;

    extraProps: IPublicTypeFieldExtraProps = {};

    // ==== dynamic properties ====
    private _title?: string;

    get title() {
        // FIXME! intl
        return (
            this._title
            || (typeof this.name === 'number' ? `项目 ${this.name}` : this.name)
        );
    }

    private _setter?: IPublicTypeSetterType;

    get setter(): IPublicTypeSetterType | null {
        if (!this._setter)
            return null;

        return this._setter;
    }

    private _expanded: boolean;

    get expanded(): boolean {
        return this._expanded;
    }

    setExpanded(value: boolean) {
        this._expanded = value;
    }

    constructor(
        parent: ISettingEntry,
        config: IPublicTypeFieldConfig,
        settingFieldCollector?: (
            name: string | number,
            field: SettingField,
        ) => void,
    ) {
        super(parent, config.name, config.type);
        markShallowReactive(this, {
            _expanded: true,
        });
        markComputed(this, ['expanded']);
        const { title, items, setter, extraProps, ...rest } = config;
        this._config = config;
        this._title = title;
        this._setter = setter;
        this.extraProps = {
            ...rest,
            ...extraProps,
        };
        this.isRequired = config.isRequired || (setter as any)?.isRequired;
        this._expanded = extraProps?.defaultExpanded ?? true;

        // initial items
        if (items && items.length > 0)
            this.initItems(items, settingFieldCollector);

        if (this.type !== 'group' && settingFieldCollector && config.name) {
            settingFieldCollector(
                getSettingFieldCollectorKey(parent, config),
                this,
            );
        }
    }

    private _items: Array<SettingField> = [];

    get items(): Array<SettingField> {
        return this._items;
    }

    get config(): IPublicTypeFieldConfig {
        return this._config;
    }

    private initItems(
        items: Array<IPublicTypeFieldConfig>,
        settingFieldCollector?: {
            (name: string | number, field: SettingField): void
            (name: string, field: SettingField): void
        },
    ) {
        this._items = items.map((item) => {
            return new SettingField(this, item, settingFieldCollector);
        });
    }

    private disposeItems() {
        this._items.forEach(item => isSettingField(item) && item.purge());
        this._items = [];
    }

    // 创建子配置项，通常用于 object/array 类型数据
    createField(config: IPublicTypeFieldConfig): SettingField {
        return new SettingField(this, config);
    }

    getConfig<K extends keyof IPublicTypeFieldConfig>(
        configName?: K,
    ): IPublicTypeFieldConfig[K] | IPublicTypeFieldConfig {
        if (configName)
            return this.config[configName];

        return this._config;
    }

    getItems(filter?: (item: SettingField) => boolean): Array<SettingField> {
        return this._items.filter((item) => {
            if (filter)
                return filter(item);

            return true;
        });
    }

    purge() {
        this.disposeItems();
    }
}

export function isSettingField(obj: any): obj is SettingField {
    return obj && obj.isSettingField;
}
