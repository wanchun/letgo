// 构建运行时 context
import type { CodeImplType } from '@webank/letgo-designer';
import { traverseNodeSchema } from '@webank/letgo-common';
import { inject, watch } from 'vue';
import { BASE_GLOBAL_CONTEXT } from '../constants';
import type { DocumentInstance } from '../interface';

export function useContext(codesInstance: Record<string, CodeImplType>, documentInstance: DocumentInstance) {
    const globalContext = inject(BASE_GLOBAL_CONTEXT) as Record<string, any>;
    const executeCtx = Object.assign({ ...globalContext }, codesInstance);

    if (documentInstance.schema?.children) {
        traverseNodeSchema(documentInstance.schema.children, (item) => {
            if (item.loop)
                executeCtx[item.ref] = [];

            else
                executeCtx[item.ref] = {};
        });
    }

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
