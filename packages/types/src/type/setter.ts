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
