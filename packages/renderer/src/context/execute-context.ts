import { computed, inject, isReactive, onUnmounted, shallowReactive, watch } from 'vue';
import { traverseNodeSchema } from '@webank/letgo-common';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { RendererProps } from '../core';
import type { CodeImplType } from '../code-impl/code-impl';
import { useCodesInstance } from '../code-impl/code-impl';
import { JavascriptFunctionLive } from '../code-impl';
import { getVueInstance } from '../utils';
import { getGlobalContextKey } from './context';

export function createExecuteContext(props: RendererProps) {
    const executeCtx: Record<string, any> = { };

    const globalContext = inject(getGlobalContextKey(), {});
    if (isReactive(globalContext)) {
        watch(globalContext, () => {
            Object.assign(executeCtx, globalContext);
        }, {
            immediate: true,
        });
    }
    else {
        Object.assign(executeCtx, globalContext);
    }

    const compInstances = shallowReactive<Record<string, any>>({});

    if (props.__schema?.children) {
        traverseNodeSchema(props.__schema.children, (item) => {
            if (item.loop)
                compInstances[item.ref] = [];

            else
                compInstances[item.ref] = {};
        });
    }

    const onCompGetCtx = (schema: IPublicTypeNodeSchema, ref: IPublicTypeComponentInstance) => {
        if (ref) {
            if (schema.ref && schema.loop) {
                const instances = compInstances[schema.ref] || [];
                if (!instances.includes(ref)) {
                    instances.push(ref);
                    compInstances[schema.ref] = instances;
                }
            }
            else {
                compInstances[schema.ref] = ref;
            }
            const instance = getVueInstance(ref);
            if (instance) {
                onUnmounted(() => {
                    if (!schema.loop) {
                        compInstances[schema.ref] = {};
                    }
                    else {
                        const index = compInstances[schema.ref].findIndex((item: IPublicTypeComponentInstance) => item === ref);
                        if (index !== -1)
                            compInstances[schema.ref].splice(index, 1);
                    }
                }, instance.$);
            }
        }
    };

    watch(compInstances, () => {
        Object.assign(executeCtx, compInstances);
    }, {
        immediate: true,
    });

    const codeInstances = shallowReactive<Record<string, any>>({});
    useCodesInstance({
        codeStruct: computed(() => props.__schema.code),
        executeCtx,
        onSet(key: string, value: CodeImplType) {
            if (value instanceof JavascriptFunctionLive)
                codeInstances[key] = value.trigger.bind(value);

            else
                codeInstances[key] = value;
            // 提前更新执行上下文
            executeCtx[key] = codeInstances[key];
        },
        onClear(keys: string[]) {
            keys.forEach((key) => {
                delete codeInstances[key];
                delete executeCtx[key];
            });
        },
    });

    watch(codeInstances, () => {
        Object.assign(executeCtx, codeInstances);
    }, {
        immediate: true,
    });

    return {
        executeCtx,
        compInstances,
        codeInstances,
        onCompGetCtx,
    };
}
