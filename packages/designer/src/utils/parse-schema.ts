import type { Component } from 'vue';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

/**
 * 转换
 * @param component
 */
export function parseMetadata(component: Component & { componentMetadata: IPublicTypeComponentMetadata }): any {
    return {
        // TODO: 转换 props
        ...component.componentMetadata,
    };
}
