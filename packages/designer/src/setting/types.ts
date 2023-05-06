import { IPublicTypeSettingTarget } from '@webank/letgo-types';
import { ComponentMeta } from '../component-meta';
import { Designer } from '../designer';
import { Node } from '../node';

export interface SettingEntry extends IPublicTypeSettingTarget {
    readonly nodes: Node[];
    readonly componentMeta: ComponentMeta | null;
    readonly designer: Designer;

    // 顶端
    readonly top: SettingEntry;
    // 父级
    readonly parent: SettingEntry;

    get: (propName: string | number) => SettingEntry | null;
}

export enum PROP_VALUE_CHANGED_TYPE {
    /**
     * normal set value
     */
    SET_VALUE = 'SET_VALUE',
    /**
     * value changed caused by sub-prop value change
     */
    SUB_VALUE_CHANGE = 'SUB_VALUE_CHANGE',
}

export interface ISetValueOptions {
    disableMutator?: boolean;
    type?: PROP_VALUE_CHANGED_TYPE;
    fromSetHotValue?: boolean;
}
