import type {
    IPublicModelSettingField,
    IPublicTypeFieldDisplay,
} from '..';

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
    isRequired?: boolean;
    /**
     * default value of target prop for setter use
     */
    defaultValue?: any | ((target: SettingField) => any);
    /**
     * get value for field
     */
    getValue?: (target: SettingField, fieldValue: any) => any;
    /**
     * set value for field
     */
    setValue?: (target: SettingField, value: any) => void;
    /**
     * the field conditional show, is not set always true
     * @default undefined
     */
    condition?: (target: SettingField) => boolean;
    /**
     * is this field is a virtual field that not save to schema
     * TODO
     */
    virtual?: (target: SettingField) => boolean;
    /**
     * default expanded when display accordion
     */
    defaultExpanded?: boolean;
    /**
     * TODO important field
     */
    important?: boolean;
    /**
     * 是否支持变量配置
     */
    supportVariable?: boolean;
    /**
     *  display
     */
    display?: IPublicTypeFieldDisplay;
    /**
     * 值变化时触发
     * @param target
     * @param value
     * @returns
     */
    onChange?: (target: SettingField, value: any) => void;
}
