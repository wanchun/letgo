// 构建运行时 context

/**
 * context 包括
 * state
 *  code
 *  instances
 *  global state
 */
import type { CodeImplType } from '@webank/letgo-designer';
import { reactive } from 'vue';
import { host } from '../host';

export function useContext(codesInstance: Record<string, CodeImplType>) {
    // TODO globalState 响应式
    const globalState = reactive({ ...host.project.config });
    const executeCtx = Object.assign({ ...globalState }, codesInstance);

    return {
        executeCtx,
    };
}
