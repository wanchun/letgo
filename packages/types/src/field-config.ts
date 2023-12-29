import type { IPublicModelSettingField, IPublicTypeSetterType } from '..';

export type IPublicTypeDisplay = 'accordion' | 'inline' | 'block' | 'plain' | 'popup';

/**
 * extra props for field
 */
export interface IPublicTypeFieldExtraProps<
    SettingField = IPublicModelSettingField,
> {
    /**
     * 是否必填参数
     * TODO
     */
    isRequired?: boolean
    /**
     * default value of target prop for setter use
     */
    defaultValue?: any | ((target: SettingField) => any)
    /**
     * get value for field
     */
    getValue?: (target: SettingField, fieldValue: any) => any
    /**
     * set value for field
     */
    setValue?: (target: SettingField, value: any) => void
    /**
     * the field conditional show, is not set always true
     * @default undefined
     */
    condition?: (target: SettingField) => boolean
    /**
     * is this field is a virtual field that not save to schema
     * TODO
     */
    virtual?: (target: SettingField) => boolean
    /**
     * default expanded when display accordion
     */
    defaultExpanded?: boolean
    /**
     * TODO important field
     */
    important?: boolean
    /**
     * 是否支持变量配置
     */
    supportVariable?: boolean
    /**
     *  display
     */
    display?: IPublicTypeDisplay
}

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
