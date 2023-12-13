// 构建运行时 context
import type { CodeImplType } from '@webank/letgo-designer';
import { inject, watch } from 'vue';
import { BASE_GLOBAL_CONTEXT } from '../constants';

export function useContext(codesInstance: Record<string, CodeImplType>) {
    const globalContext = inject(BASE_GLOBAL_CONTEXT) as Record<string, any>;
    const executeCtx = Object.assign({ ...globalContext }, codesInstance);
    watch(globalContext, (value, oldValue) => {
        Object.keys(oldValue).forEach((key) => {
            if (!value[key])
                delete executeCtx[key];
        });
        Object.assign(executeCtx, globalContext);
    });

    return {
        executeCtx,
    };
}
