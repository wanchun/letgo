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
import { host } from '../host';

export function useContext(codesInstance: Record<string, CodeImplType>, vueInstanceMap: Map<string | number, IPublicTypeComponentInstance>) {
    // TODO globalState 响应式
    const globalState = host.project.config;

    const executeCtx = new Proxy({}, {
        get(target, prop: string) {
            return globalState[prop] || codesInstance[prop] || vueInstanceMap.get(prop);
        },
    });

    return {
        executeCtx,
    };
}
