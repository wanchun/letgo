import { EventEmitter } from 'eventemitter3';
import { IEditor } from '@webank/letgo-types';
import { Node } from '../node';
import { ComponentMeta } from '../component-meta';
import { Designer } from '../designer';
import { SettingEntry } from './types';
import { SettingField } from './setting-field';
import { SettingProp } from './setting-prop';

function generateSessionId(nodes: Node[]) {
    return nodes
        .map((node) => node.id)
        .sort()
        .join(',');
}

export class SettingTop implements SettingEntry {
    private emitter = new EventEmitter();

    private _items: Array<SettingField> = [];

    private _componentMeta: ComponentMeta | null = null;

    private _isSame = true;

    private _settingFieldMap: { [prop: string]: SettingField } = {};

    readonly path: string[] = [];

    readonly top: SettingEntry;

    readonly parent: SettingEntry;

    get componentMeta() {
        return this._componentMeta;
    }

    get items() {
        return this._items;
    }

    /**
     * 同样的
     */
    get isSameComponent(): boolean {
        return this._isSame;
    }

    /**
     * 一个
     */
    get isSingle(): boolean {
        return this.nodes.length === 1;
    }

    get isLocked(): boolean {
        return this.firstNode.isLocked;
    }

    /**
     * 多个
     */
    get isMultiple(): boolean {
        return this.nodes.length > 1;
    }

    readonly id: string;

    readonly firstNode: Node;

    readonly designer: Designer;

    disposeFunctions: any[] = [];

    constructor(readonly editor: IEditor, readonly nodes: Node[]) {
        if (!Array.isArray(nodes) || nodes.length < 1) {
            throw new ReferenceError('nodes should not be empty');
        }
        this.top = this;
        this.parent = this;
        this.id = generateSessionId(nodes);
        this.firstNode = nodes[0];
        this.designer = this.firstNode.document.designer;

        // setups
        this.setupComponentMeta();

        // clear fields
        this.setupItems();

        this.disposeFunctions.push(this.setupEvents());
    }

    private setupComponentMeta() {
        // todo: enhance compile a temp configure.compiled
        const { firstNode } = this;
        const meta = firstNode.componentMeta;
        const l = this.nodes.length;
        let theSame = true;
        for (let i = 1; i < l; i++) {
            const other = this.nodes[i];
            if (other.componentMeta !== meta) {
                theSame = false;
                break;
            }
        }
        if (theSame) {
            this._isSame = true;
            this._componentMeta = meta;
        } else {
            this._isSame = false;
            this._componentMeta = null;
        }
    }

    private setupItems() {
        if (this.componentMeta) {
            const settingFieldMap: { [prop: string]: SettingField } = {};
            const settingFieldCollector = (
                name: string | number,
                field: SettingField,
            ) => {
                settingFieldMap[name] = field;
            };
            this._items = this.componentMeta.propsConfigure.map((item) => {
                return new SettingField(this, item, settingFieldCollector);
            });
            this._settingFieldMap = settingFieldMap;
        }
    }

    private setupEvents() {
        return this.componentMeta?.onMetadataChange(() => {
            this.setupItems();
        });
    }

    /**
     * 获取当前属性值
     */
    getValue(): any {
        return this.firstNode?.propsData;
    }

    /**
     * 设置当前属性值
     */
    setValue(val: any) {
        this.setProps(val);
    }

    /**
     * 获取子项
     */
    get(propName: string | number): SettingProp | null {
        if (!propName) return null;
        return (
            this._settingFieldMap[propName] || new SettingProp(this, propName)
        );
    }

    /**
     * 获取子级属性值
     */
    getPropValue(propName: string | number): any {
        return this.firstNode.getProp(`${propName}`, true)?.getValue();
    }

    /**
     * 设置子级属性值
     */
    setPropValue(propName: string | number, value: any) {
        this.nodes.forEach((node) => {
            node.setPropValue(`${propName}`, value);
        });
    }

    /**
     * 清除已设置值
     */
    clearPropValue(propName: string | number) {
        this.nodes.forEach((node) => {
            node.clearPropValue(`${propName}`);
        });
    }

    /**
     * 获取顶层附属属性值
     */
    getExtraPropValue(propName: string) {
        return this.firstNode.getExtraProp(propName, false)?.getValue();
    }

    /**
     * 设置顶层附属属性值
     */
    setExtraPropValue(propName: string, value: any) {
        this.nodes.forEach((node) => {
            node.getExtraProp(propName, true)?.setValue(value);
        });
    }

    // 设置多个属性值，替换原有值
    setProps(data: object) {
        this.nodes.forEach((node) => {
            node.setProps(data as any);
        });
    }

    // 设置多个属性值，和原有值合并
    mergeProps(data: object) {
        this.nodes.forEach((node) => {
            node.mergeProps(data as any);
        });
    }

    getId() {
        return this.id;
    }

    getPage() {
        return this.firstNode.document;
    }

    getNode(): Node {
        return this.nodes[0];
    }

    private disposeItems() {
        this._items.forEach((item) => isPurge(item) && item.purge());
        this._items = [];
    }

    purge() {
        this.disposeItems();
        this._settingFieldMap = {};
        this.emitter.removeAllListeners();
        this.disposeFunctions.forEach((f) => f());
        this.disposeFunctions = [];
    }
}

interface Purge {
    purge(): void;
}

function isPurge(obj: any): obj is Purge {
    return obj && obj.purge;
}
