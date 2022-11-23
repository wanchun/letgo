import { Component, Slot } from 'vue';
import { SettingTarget } from './setting-target';
import { PropConfig } from './prop-config';

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
     * 校验的 schema 确认用什么组件来渲染
     */
    tester: (scheme: PropConfig) => boolean;
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
     *
     * the props pass to Setter Component
     */
    props?: Record<string, unknown> | DynamicProps;
    /**
     * 给 MixedSetter 时切换 Setter 展示用的
     */
    title?: string;
    /**
     * 是否必填？
     *
     * ArraySetter 里有个快捷预览，可以在不打开面板的情况下直接编辑
     */
    isRequired?: boolean;
    /**
     * Setter 的初始值
     */
    defaultValue?: any | ((target: SettingTarget) => any);
    /**
     * 给 MixedSetter 用于判断优先选中哪个
     */
    condition?: (target: SettingTarget) => boolean;
}

// if *string* passed must be a registered Setter Name, future support blockSchema
export type SetterType = SetterConfig | SetterConfig[] | string | CustomView;

export function isSetterConfig(obj: any): obj is SetterConfig {
    return obj && typeof obj === 'object' && 'componentName' in obj;
}

export function isCustomView(obj: any): obj is CustomView {
    return obj && typeof obj === 'function';
}
