import { Component, Slot } from 'vue';
import { SettingTarget } from './setting-target';

export interface Setter {
    /**
     * 设置器类型
     */
    type: string;
    /**
     * 设置器名称
     */
    title?: string;
    /**
     * 设置器组件
     */
    Component: Component;
    /**
     * 给 MixedSetter 用于判断优先选中哪个
     */
    condition?: (target: SettingTarget) => boolean;
}

export type CustomView = Slot;

export type DynamicProps = (target: SettingTarget) => Record<string, unknown>;

export interface SetterConfig {
    /**
     * 配置设置器用哪一个 setter
     * if *string* passed must be a registered Setter Name
     */
    componentName: string | CustomView;
    /**
     * 传递给 setter 的属性
     * the props pass to Setter Component
     */
    props?: Record<string, unknown> | DynamicProps;
    /**
     * 给 MixedSetter 时切换 Setter 展示用的
     */
    title?: string;
    /**
     * 给 MixedSetter 用于判断优先选中哪个
     */
    condition?: (target: SettingTarget) => boolean;

    // for MixedSetter
    isRequired?: boolean;
    // for MixedSetter
    defaultValue?: any;
}

// if *string* passed must be a registered Setter Name, future support blockSchema
export type SetterType = SetterConfig | SetterConfig[] | string;

export function isSetterConfig(obj: any): obj is SetterConfig {
    return obj && typeof obj === 'object' && 'componentName' in obj;
}

export function isCustomView(obj: any): obj is CustomView {
    return obj && typeof obj === 'function';
}
