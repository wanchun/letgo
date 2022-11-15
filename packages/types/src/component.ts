import { ComponentPublicInstance } from 'vue';

/**
 * 组件实例定义
 */
export type ComponentInstance = ComponentPublicInstance;

export interface IComponentRecord {
    did: string;
    nid: string;
    cid: number;
}
