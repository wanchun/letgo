import { SetterType, FieldExtraProps, FieldConfig } from '@webank/letgo-types';
import { SettingProp } from './setting-prop';
import { SettingEntry } from './types';

function getSettingFieldCollectorKey(
    parent: SettingEntry,
    config: FieldConfig,
) {
    const path = [config.name];
    let cur = parent;
    while (cur !== parent.top) {
        if (cur instanceof SettingField && cur.type !== 'group') {
            path.unshift(cur.name);
        }
        cur = cur.parent;
    }
    return path.join('.');
}

export class SettingField extends SettingProp implements SettingEntry {
    readonly isSettingField = true;

    readonly isRequired: boolean;

    private _config: FieldConfig;

    extraProps: FieldExtraProps = {};

    // ==== dynamic properties ====
    private _title?: string;

    get title() {
        // FIXME! intl
        return (
            this._title ||
            (typeof this.name === 'number' ? `项目 ${this.name}` : this.name)
        );
    }

    private _setter?: SetterType;

    get setter(): SetterType | null {
        if (!this._setter) {
            return null;
        }
        return this._setter;
    }

    private _expanded = true;

    get expanded(): boolean {
        return this._expanded;
    }

    setExpanded(value: boolean) {
        this._expanded = value;
    }

    constructor(
        parent: SettingEntry,
        config: FieldConfig,
        settingFieldCollector?: (
            name: string | number,
            field: SettingField,
        ) => void,
    ) {
        super(parent, config.name, config.type);
        const { title, items, setter, extraProps, ...rest } = config;
        this._config = config;
        this._title = title;
        this._setter = setter;
        this.extraProps = {
            ...rest,
            ...extraProps,
        };
        this.isRequired = config.isRequired || (setter as any)?.isRequired;
        this._expanded = !extraProps?.defaultCollapsed;

        // initial items
        if (items && items.length > 0) {
            this.initItems(items, settingFieldCollector);
        }
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

    get config(): FieldConfig {
        return this._config;
    }

    private initItems(
        items: Array<FieldConfig>,
        settingFieldCollector?: {
            (name: string | number, field: SettingField): void;
            (name: string, field: SettingField): void;
        },
    ) {
        this._items = items.map((item) => {
            return new SettingField(this, item, settingFieldCollector);
        });
    }

    private disposeItems() {
        this._items.forEach((item) => isSettingField(item) && item.purge());
        this._items = [];
    }

    // 创建子配置项，通常用于 object/array 类型数据
    createField(config: FieldConfig): SettingField {
        return new SettingField(this, config);
    }

    getConfig<K extends keyof FieldConfig>(
        configName?: K,
    ): FieldConfig[K] | FieldConfig {
        if (configName) {
            return this.config[configName];
        }
        return this._config;
    }

    getItems(filter?: (item: SettingField) => boolean): Array<SettingField> {
        return this._items.filter((item) => {
            if (filter) {
                return filter(item);
            }
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
