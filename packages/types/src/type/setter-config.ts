import type {
    IPublicModelSettingField,
    IPublicTypeCustomView,
    IPublicTypeDynamicSetterProps,
} from '..';

export interface IPublicTypeSetterConfig {
    /**
     * 配置设置器用哪一个 setter
     * if *string* passed must be a registered IPublicTypeSetter Name
     */
    componentName: string | IPublicTypeCustomView
    /**
     * 传递给 setter 的属性
     * the props pass to IPublicTypeSetter Component
     */
    props?: Record<string, unknown> | IPublicTypeDynamicSetterProps
    /**
     * 给 MixedSetter 时切换 IPublicTypeSetter 展示用的
     */
    title?: string
    /**
     * 给 MixedSetter 用于判断优先选中哪个
     */
    condition?: (target: IPublicModelSettingField) => boolean

    // for MixedSetter
    isRequired?: boolean
    // for MixedSetter
    defaultValue?: any
}

export function isSetterConfig(obj: any): obj is IPublicTypeSetterConfig {
    return obj && typeof obj === 'object' && 'componentName' in obj;
}
