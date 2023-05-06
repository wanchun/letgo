import type { ComponentPublicInstance } from 'vue';

/**
 * 组件实例定义
 */
export type IPublicTypeComponentInstance = ComponentPublicInstance;

export interface IPublicTypeComponentRecord {
    did: string
    nid: string
    cid: number
}
