import { EventEmitter } from 'eventemitter3';
import { GlobalEvent, IEditor, isJSExpression } from '@webank/letgo-types';
import { uniqueId } from '@webank/letgo-utils';
import { Node } from '../node';
import { ComponentMeta } from '../component-meta';
import { Designer } from '../designer';
import { SettingEntry, ISetValueOptions } from './types';

export class SettingProp implements SettingEntry {
    // === static properties ===
    readonly editor: IEditor;

    readonly isSameComponent: boolean;

    readonly isMultiple: boolean;

    readonly isSingle: boolean;

    readonly nodes: Node[];

    readonly componentMeta: ComponentMeta | null;

    readonly designer: Designer;

    readonly top: SettingEntry;

    readonly parent: SettingEntry;

    readonly isGroup: boolean;

    readonly type: 'field' | 'group';

    readonly id = uniqueId('entry');

    private emitter = new EventEmitter();

    // ==== dynamic properties ====
    private _name: string | number;

    get name() {
        return this._name;
    }

    get path() {
        const path = this.parent.path.slice();
        if (this.type === 'field') {
            path.push(this.name);
        }
        return path;
    }

    extraProps: any = {};

    constructor(
        parent: SettingEntry,
        name: string | number,
        type?: 'field' | 'group',
    ) {
        if (type == null) {
            const c = typeof name === 'string' ? name.slice(0, 1) : '';
            if (c === '#') {
                this.type = 'group';
            } else {
                this.type = 'field';
            }
        } else {
            this.type = type;
        }
        // initial self properties
        this.parent = parent;
        this._name = name;
        this.isGroup = this.type === 'group';

        // copy parent static properties
        this.editor = parent.editor;
        this.nodes = parent.nodes;
        this.componentMeta = parent.componentMeta;
        this.isSameComponent = parent.isSameComponent;
        this.isMultiple = parent.isMultiple;
        this.isSingle = parent.isSingle;
        this.designer = parent.designer;
        this.top = parent.top;
    }

    getId() {
        return this.id;
    }

    setKey(key: string | number) {
        if (this.type !== 'field') {
            return;
        }
        const propName = this.path.join('.');
        let l = this.nodes.length;
        while (l-- > 0) {
            this.nodes[l].getProp(propName, true).key = key;
        }
        this._name = key;
    }

    getKey() {
        return this._name;
    }

    remove() {
        if (this.type !== 'field') {
            return;
        }
        const propName = this.path.join('.');
        let l = this.nodes.length;
        while (l-- > 0) {
            this.nodes[l].getProp(propName)?.remove();
        }
    }

    // ====== ?????????????????? =====

    /**
     * ?????????????????????????????????
     * -1 ?????????
     * 0 ??????
     * 1 ????????????????????????????????????
     * 2 ?????????
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
        if (this.nodes.length === 1) {
            return 2;
        }
        const propName = this.path.join('.');
        const first = this.nodes[0].getProp(propName);
        let l = this.nodes.length;
        let state = 2;
        while (--l > 0) {
            const next = this.nodes[l].getProp(propName, false);
            const s = first.compare(next);
            if (s > 1) {
                return -1;
            }
            if (s === 1) {
                state = 1;
            }
        }
        if (state === 2 && first.isUnset()) {
            return 0;
        }
        return state;
    }

    /**
     * ?????????????????????
     */
    getValue(): any {
        let val: any;
        if (this.type === 'field') {
            val = this.parent.getPropValue(this.name);
        }
        const { getValue } = this.extraProps;
        try {
            return getValue ? getValue(this, val) : val;
        } catch (e) {
            console.warn(e);
            return val;
        }
    }

    /**
     * ?????????????????????
     */
    setValue(
        val: any,
        isHotValue?: boolean,
        force?: boolean,
        extraOptions?: ISetValueOptions,
    ) {
        const oldValue = this.getValue();

        if (this.type === 'field') {
            this.parent.setPropValue(this.name, val);
        }

        const { setValue } = this.extraProps;
        if (setValue && !extraOptions?.disableMutator) {
            try {
                setValue(this, val);
            } catch (e) {
                /* istanbul ignore next */
                console.warn(e);
            }
        }

        this.notifyValueChange(oldValue, val);
    }

    /**
     * ?????????????????????
     */
    clearValue() {
        if (this.type === 'field') {
            this.parent.clearPropValue(this.name);
        }
        const { setValue } = this.extraProps;
        if (setValue) {
            try {
                setValue(this, undefined);
            } catch (e) {
                /* istanbul ignore next */
                console.warn(e);
            }
        }
    }

    /**
     * ????????????
     */
    get(propName: string | number) {
        const path = this.path.concat(propName).join('.');
        return this.top.get(path);
    }

    /**
     * ?????????????????????
     */
    getPropValue(propName: string | number): any {
        return this.top.getPropValue(this.path.concat(propName).join('.'));
    }

    /**
     * ?????????????????????
     */
    setPropValue(propName: string | number, value: any) {
        const path = this.path.concat(propName).join('.');
        this.top.setPropValue(path, value);
    }

    /**
     * ??????????????????
     */
    clearPropValue(propName: string | number) {
        const path = this.path.concat(propName).join('.');
        this.top.clearPropValue(path);
    }

    /**
     * ???????????????????????????
     */
    getExtraPropValue(propName: string) {
        return this.top.getExtraPropValue(propName);
    }

    /**
     * ???????????????????????????
     */
    setExtraPropValue(propName: string, value: any) {
        this.top.setExtraPropValue(propName, value);
    }

    // ======= compatibles for vision ======
    getNode() {
        return this.nodes[0];
    }

    getName(): string {
        return this.path.join('.');
    }

    onValueChange(func: () => any) {
        this.emitter.on('value-change', func);
        return () => {
            this.emitter.removeListener('value-change', func);
        };
    }

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
        if (isJSExpression(v)) {
            return v.value;
        }
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
        if (this.isUseVariable() === flag) {
            return;
        }
        const v = this.getValue();
        if (this.isUseVariable()) {
            this.setValue(v.mock);
        } else {
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

    get useVariable() {
        return this.isUseVariable();
    }

    getMockOrValue() {
        const v = this.getValue();
        if (isJSExpression(v)) {
            return v.mock;
        }
        return v;
    }
}
