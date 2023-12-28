import type { IPublicTypeSetterType, IPublicTypeSettingTarget } from '@webank/letgo-types';
import type { ComponentMeta } from '../component-meta';
import type { Designer } from '../designer';
import type { INode } from '../types';

export interface ISettingEntry extends IPublicTypeSettingTarget {
    readonly nodes: INode[]
    readonly componentMeta: ComponentMeta | null
    readonly designer: Designer

    // 顶端
    readonly top: ISettingEntry
    // 父级
    readonly parent: ISettingEntry

    readonly setter?: IPublicTypeSetterType | null

    get: (propName: string | number) => ISettingEntry | null
}
