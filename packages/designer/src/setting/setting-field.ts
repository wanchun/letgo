import { markShallowReactive, uniqueId } from '@webank/letgo-common';
import type {
    IBaseModelSettingField,
    IPublicEditor,
    IPublicTypeCompositeValue,
    IPublicTypeFieldConfig,
    IPublicTypeFieldExtraProps,
    IPublicTypeSetValueOptions,
    IPublicTypeSetterType,
} from '@webank/letgo-types';
import { GlobalEvent, isJSExpression } from '@webank/letgo-types';
import { EventEmitter } from 'eventemitter3';
import type { ComponentMeta } from '../component-meta';
import type { Designer } from '../designer';
import type { INode } from '../types';
import type { ISettingTop, SettingTop } from './setting-top';

export interface ISettingField extends IBaseModelSettingField<SettingTop, SettingField, ComponentMeta, INode> {

}

export interface IFieldConfig extends IPublicTypeFieldConfig<SettingField> {}

function getSettingFieldCollectorKey(
    parent: ISettingField | ISettingTop,
    config: IFieldConfig,
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

export class SettingField implements ISettingField {
    extraProps: IPublicTypeFieldExtraProps<SettingField> = {};

    // === static properties ===
    private emitter = new EventEmitter();

    readonly designer: Designer;

    readonly editor: IPublicEditor;

    readonly isSameComponent: boolean;

    readonly isMultiple: boolean;

    readonly isSingle: boolean;

    readonly nodes: INode[];

    readonly componentMeta: ComponentMeta | null;

    readonly top: SettingTop;

    readonly parent: SettingField | SettingTop;

    readonly isGroup: boolean;

    readonly type: 'field' | 'group';

    readonly id = uniqueId('entry');

    readonly isSettingField = true;

    readonly isRequired: boolean;

    private _name: string | number;

    get name() {
        return this._name;
    }

    get path(): (string | number)[] {
        const path = this.parent.path.slice();
        if (this.type === 'field')
            path.push(this.name);

        return path;
    }

    private _config: IFieldConfig;

    get config(): IFieldConfig {
        return this._config;
    }

    // ==== dynamic properties ====
    private _title?: string;

    get title() {
        // FIXME! intl
        return (
            this._title
            || (typeof this.name === 'number' ? `项目 ${this.name}` : this.name)
        );
    }

    private _description?: string;
    get description() {
        return this._description;
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

    private _items: Array<SettingField> = [];

    get items(): Array<SettingField> {
        return this._items;
    }

    /**
     * 判断当前属性值是否一致
     * -1 多种值
     * 0 无值
     * 1 类似值，比如数组长度一样
     * 2 单一植
     */
    /* istanbul ignore next */
    get valueState(): number {
        if (this.type !== 'field') {
            const { getValue } = this.extraProps;
            return getValue
                ? getValue(this, undefined) === undefined
                    ? 0
                    : 1
                : 0;
        }
        if (this.nodes.length === 1)
            return 2;

        const propName = this.path.join('.');
        const first = this.nodes[0].getProp(propName);
        let l = this.nodes.length;
        let state = 2;
        while (--l > 0) {
            const next = this.nodes[l].getProp(propName, false);
            const s = first.compare(next);
            if (s > 1)
                return -1;

            if (s === 1)
                state = 1;
        }
        if (state === 2 && first.isUnset())
            return 0;

        return state;
    }

    get useVariable() {
        return this.isUseVariable();
    }

    constructor(
        parent: SettingField | SettingTop,
        config: IFieldConfig,
        private settingFieldCollector?: (
            name: string | number,
            field: SettingField,
        ) => void,
    ) {
        const { title, items, setter, name, type, extraProps, description, ...rest } = config;

        if (type == null) {
            const c = typeof name === 'string' ? name.slice(0, 1) : '';
            if (c === '#')
                this.type = 'group';

            else
                this.type = 'field';
        }
        else {
            this.type = type;
        }
        this._config = config;
        this._title = title;
        this._description = description;
        this._setter = setter;
        this.extraProps = {
            ...rest,
            ...extraProps,
        };
        this._expanded = extraProps?.defaultExpanded ?? true;
        this._name = config.name;
        this.isRequired = config.isRequired || (setter as any)?.isRequired;
        this.parent = parent;
        this.isGroup = this.type === 'group';
        this.editor = parent.editor;
        this.nodes = parent.nodes;
        this.componentMeta = parent.componentMeta;
        this.isSameComponent = parent.isSameComponent;
        this.isMultiple = parent.isMultiple;
        this.isSingle = parent.isSingle;
        this.designer = parent.designer;
        this.top = parent.top;

        markShallowReactive(this, {
            _expanded: true,
        });

        // initial items
        if (items && items.length > 0)
            this.initItems(items, settingFieldCollector);

        if (this.type !== 'group' && settingFieldCollector && config.name) {
            settingFieldCollector(
                getSettingFieldCollectorKey(parent, config),
                this,
            );
        }

        if (this.extraProps.onChange) {
            this.nodes.forEach((node) => {
                node.onPropChange(({ prop }) => {
                    if (prop.path.join('.') === this.path.join('.'))
                        this.extraProps.onChange(this, this.getValue());
                });
            });
        }
    }

    private initItems(
        items: Array<IFieldConfig>,
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
        this._items.forEach(item => isSettingField(item) && item.purge());
        this._items = [];
    }

    getKey() {
        return this._name;
    }

    setKey(key: string | number, changePropKey = false) {
        if (this.type !== 'field')
            return;

        if (changePropKey) {
            const propName = this.path.join('.');
            let l = this.nodes.length;
            while (l-- > 0)
                this.nodes[l].getProp(propName, true).setKey(key);
        }

        this._name = key;
    }

    /**
     * 获取当前属性值
     */
    getValue(): any {
        let val: any;
        if (this.type === 'field')
            val = this.parent.getPropValue(this.name);

        const { getValue } = this.extraProps;
        try {
            return getValue ? getValue(this, val) : val;
        }
        catch (e) {
            console.warn(e);
            return val;
        }
    }

    /**
     * 设置当前属性值
     */
    setValue(
        val: IPublicTypeCompositeValue,
        extraOptions?: IPublicTypeSetValueOptions,
    ) {
        const oldValue = this.getValue();

        if (this.type === 'field')
            this.parent.setPropValue(this.name, val);

        const { setValue } = this.extraProps;
        if (setValue && !extraOptions?.disableMutator) {
            try {
                setValue(this, val);
            }
            catch (e) {
                /* istanbul ignore next */
                console.warn(e);
            }
        }

        this.notifyValueChange(oldValue, val);
    }

    /**
     * 清除已设置的值
     */
    clearValue() {
        if (this.type === 'field')
            this.parent.clearPropValue(this.name);

        const { setValue } = this.extraProps;
        if (setValue) {
            try {
                setValue(this, undefined);
            }
            catch (e) {
                /* istanbul ignore next */
                console.warn(e);
            }
        }
    }

    /**
     * 获取子项
     */
    get(propName: string | number) {
        const path = this.path.concat(propName).join('.');
        return this.top.get(path);
    }

    /**
     * 获取子级属性值
     */
    getPropValue(propName: string | number): any {
        return this.top.getPropValue(this.path.concat(propName).join('.'));
    }

    /**
     * 设置子级属性值
     */
    setPropValue(propName: string | number, value: any) {
        const path = this.path.concat(propName).join('.');
        this.top.setPropValue(path, value);
    }

    /**
     * 清除已设置值
     */
    clearPropValue(propName: string | number) {
        const path = this.path.concat(propName).join('.');
        this.top.clearPropValue(path);
    }

    /**
     * 获取顶层附属属性值
     */
    getExtraPropValue(propName: string) {
        return this.top.getExtraPropValue(propName);
    }

    /**
     * 设置顶层附属属性值
     */
    setExtraPropValue(propName: string, value: any) {
        this.top.setExtraPropValue(propName, value);
    }

    /**
     * 监听值改变
     */
    onValueChange(func: () => any) {
        this.emitter.on('value-change', func);
        return () => {
            this.emitter.removeListener('value-change', func);
        };
    }

    /**
     * 触发值改变
     */
    notifyValueChange(oldValue: any, newValue: any) {
        this.emitter.emit('value-change');
        this.editor.emit(GlobalEvent.Node.Prop.Change, {
            node: this.getNode(),
            prop: this,
            oldValue,
            newValue,
        });
    }

    getDefaultValue() {
        return this.extraProps.defaultValue;
    }

    getVariableValue() {
        const v = this.getValue();
        if (isJSExpression(v))
            return v.value;

        return '';
    }

    setVariableValue(value: string) {
        const v = this.getValue();
        this.setValue({
            type: 'JSExpression',
            value,
            mock: isJSExpression(v) ? v.mock : v,
        });
    }

    setUseVariable(flag: boolean) {
        if (this.isUseVariable() === flag)
            return;

        const v = this.getValue();
        if (this.isUseVariable()) {
            this.setValue(v.mock);
        }
        else {
            this.setValue({
                type: 'JSExpression',
                value: '',
                mock: v,
            });
        }
    }

    isUseVariable() {
        return isJSExpression(this.getValue());
    }

    getMockOrValue() {
        const v = this.getValue();
        if (isJSExpression(v))
            return v.mock;

        return v;
    }

    // 创建子配置项，通常用于 object/array 类型数据
    createField(config: IFieldConfig): SettingField {
        this.settingFieldCollector?.(getSettingFieldCollectorKey(this.parent, config), this);
        return new SettingField(this, config, this.settingFieldCollector);
    }

    getConfig<K extends keyof IFieldConfig>(
        configName?: K,
    ): IFieldConfig[K] | IFieldConfig {
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

    getNode() {
        return this.nodes[0];
    }

    /**
     * 获取完整属性名
     */
    getFullName(): string {
        return this.path.join('.');
    }

    getId() {
        return this.id;
    }

    remove() {
        if (this.type !== 'field')
            return;

        const propName = this.path.join('.');
        let l = this.nodes.length;
        while (l-- > 0)
            this.nodes[l].getProp(propName)?.remove();
    }

    purge() {
        this.disposeItems();
        this.emitter.removeAllListeners();
    }
}

export function isSettingField(obj: any): obj is SettingField {
    return obj && obj.isSettingField;
}
