import type {
    IPublicModelSettingField,
    IPublicTypeFieldExtraProps,
    IPublicTypeSetterType,
} from '..';

/**
 * 属性面板配置
 */
export interface IPublicTypeFieldConfig<
    SettingField = IPublicModelSettingField,
> extends IPublicTypeFieldExtraProps<SettingField> {
    /**
     * 面板配置隶属于单个 field 还是分组
     */
    type?: 'field' | 'group'
    /**
     * the name of this setting field, which used in quickEditor
     */
    name?: string | number
    /**
     * the field title
     */
    title?: string
    /**
     * 单个属性的 setter 配置
     *
     * the field body contains when .type = 'field'
     */
    setter?: IPublicTypeSetterType
    /**
     * the setting items which group body contains when .type = 'group'
     */
    items?: IPublicTypeFieldConfig<SettingField>[]
    /**
     * extra props for field
     * 其他配置属性（不做流通要求）
     */
    extraProps?: IPublicTypeFieldExtraProps<SettingField>
    /**
     * 属性描述
     */
    description?: string
}
