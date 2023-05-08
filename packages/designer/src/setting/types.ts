import type { IPublicTypeSettingTarget } from '@webank/letgo-types';
import type { ComponentMeta } from '../component-meta';
import type { Designer } from '../designer';
import type { INode } from '../types';

export interface SettingEntry extends IPublicTypeSettingTarget {
    readonly nodes: INode[]
    readonly componentMeta: ComponentMeta | null
    readonly designer: Designer

    // 顶端
    readonly top: SettingEntry
    // 父级
    readonly parent: SettingEntry

    get: (propName: string | number) => SettingEntry | null
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
    disableMutator?: boolean
    type?: PROP_VALUE_CHANGED_TYPE
    fromSetHotValue?: boolean
}
