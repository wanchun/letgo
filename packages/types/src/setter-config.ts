import type { Component, Slot } from 'vue';
import type { IPublicModelSettingField } from '..';

export interface IPublicTypeSetter {
    /**
     * 设置器类型
     */
    type: string
    /**
     * 设置器名称
     */
    title?: string
    /**
     * 设置器组件
     */
    Component: Component
    /**
     * 给 MixedSetter 用于判断优先选中哪个
     */
    condition?: (target: IPublicModelSettingField) => boolean
}

export type IPublicTypeCustomView = Slot;

export type IPublicTypeDynamicProps = (target: IPublicModelSettingField) => Record<string, unknown>;

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
    props?: Record<string, unknown> | IPublicTypeDynamicProps
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

// if *string* passed must be a registered IPublicTypeSetter Name, future support blockSchema
export type IPublicTypeSetterType = IPublicTypeSetterConfig | string | Array<string | IPublicTypeSetterConfig>;

export function isSetterConfig(obj: any): obj is IPublicTypeSetterConfig {
    return obj && typeof obj === 'object' && 'componentName' in obj;
}

export function isCustomView(obj: any): obj is IPublicTypeCustomView {
    return obj && typeof obj === 'function';
}
