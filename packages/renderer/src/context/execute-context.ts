import { computed, inject, onUnmounted, reactive, watch } from 'vue';
import { traverseNodeSchema } from '@webank/letgo-common';
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

    if (props.__schema?.children) {
        traverseNodeSchema(props.__schema.children, (item) => {
            if (item.loop)
                executeCtx[item.ref] = [];

            else
                executeCtx[item.ref] = {};
        });
    }

    const onCompGetCtx = (schema: IPublicTypeNodeSchema, ref: IPublicTypeComponentInstance) => {
        if (ref) {
            if (schema.ref && schema.loop) {
                const instances = executeCtx[schema.ref] || [];
                if (!instances.includes(ref)) {
                    instances.push(ref);
                    executeCtx[schema.ref] = instances;
                }
            }
            else {
                executeCtx[schema.ref] = ref;
            }

            onUnmounted(() => {
                if (!schema.loop) {
                    executeCtx[schema.ref] = {};
                }
                else {
                    const index = executeCtx[schema.ref].findIndex((item: IPublicTypeComponentInstance) => item === ref);
                    if (index !== -1)
                        executeCtx[schema.ref].splice(index, 1);
                }
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
