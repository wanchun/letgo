import { computed, inject, onUnmounted, reactive, watch } from 'vue';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { RendererProps } from '../core';
import type { CodeImplType } from '../code-impl/code-impl';
import { useCodesInstance } from '../code-impl/code-impl';
import { JavascriptFunctionLive } from '../code-impl';
import { getGlobalContextKey } from './context';

export function createExecuteContext(props: RendererProps) {
    const executeCtx: Record<string, any> = reactive({ });

    const globalContext = inject(getGlobalContextKey(), {});
    watch(globalContext, () => {
        Object.assign(executeCtx, globalContext);
    }, {
        immediate: true,
    });

    const onCompGetCtx = (schema: IPublicTypeNodeSchema, ref: IPublicTypeComponentInstance) => {
        if (ref) {
            if (schema.ref)
                executeCtx[schema.ref] = ref;
            onUnmounted(() => {
                delete executeCtx[schema.ref];
            }, ref.$);
        }
    };

    useCodesInstance({
        codeStruct: computed(() => props.__schema.code),
        executeCtx,
        onSet(key: string, value: CodeImplType) {
            if (value instanceof JavascriptFunctionLive)
                executeCtx[key] = value.trigger.bind(value);

            else
                executeCtx[key] = value;
        },
        onClear(keys: string[]) {
            keys.forEach((key) => {
                delete executeCtx[key];
            });
        },
    });

    return {
        executeCtx,
        onCompGetCtx,
    };
}
