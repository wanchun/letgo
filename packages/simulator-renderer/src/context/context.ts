// 构建运行时 context

/**
 * context 包括
 * state
 *  code
 *  instances
 *  global state
 */
import { host } from '../host';

export function useContext() {
    // TODO globalState 响应式
    const globalState = host.project.config;
}
