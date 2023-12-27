import type { IPublicModelComponentMeta, IPublicModelNode, IPublicTypeSetterType, IPublicTypeSettingTarget } from '..';

export interface IPublicTypeSettingEntry extends IPublicTypeSettingTarget {
    readonly nodes: IPublicModelNode[]
    readonly componentMeta: IPublicModelComponentMeta | null
    readonly designer: Designer

    // 顶端
    readonly top: IPublicTypeSettingEntry
    // 父级
    readonly parent: IPublicTypeSettingEntry

    readonly setter?: IPublicTypeSetterType | null

    get: (propName: string | number) => IPublicTypeSettingEntry | null
}
