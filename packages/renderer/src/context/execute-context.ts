import { computed, onUnmounted, reactive, watch } from 'vue';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { CodeImplType } from '@webank/letgo-designer';
import type { RendererProps } from '../core';
import { useCodesInstance } from '../code-impl/code-impl';

export function createExecuteContext(props: RendererProps) {
    const executeCtx = reactive({ ...props.__config });
    watch(() => props.__config, () => {
        Object.assign(executeCtx, props.__config);
    }, {
        deep: true,
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
        onSet(key: string, value: CodeImplType) {
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
