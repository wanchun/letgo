// 构建运行时 context

/**
 * context 包括
 * state
 *  code
 *  instances
 *  global state
 */
import type { CodeImplType } from '@webank/letgo-designer';
import type { IPublicTypeComponentInstance } from '@webank/letgo-types';
import { reactive, watch } from 'vue';
import { host } from '../host';

export function useContext(codesInstance: Record<string, CodeImplType>, vueInstanceMap: Record<string | number, IPublicTypeComponentInstance>) {
    // TODO globalState 响应式
    const executeCtx = reactive(host.project.config);

    watch(codesInstance, () => {
        Object.assign(executeCtx, codesInstance);
    }, {
        immediate: true,
        deep: true,
    });
    watch(vueInstanceMap, () => {
        Object.assign(executeCtx, vueInstanceMap);
    }, {
        immediate: true,
        deep: true,
    });

    return {
        executeCtx,
    };
}
