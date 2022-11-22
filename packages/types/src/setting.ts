import type { Component } from 'vue';
import type { PropConfig } from './prop-config';

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
