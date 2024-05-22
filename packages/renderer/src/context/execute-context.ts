import { computed, inject, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, watch } from 'vue';
import { traverseNodeSchema } from '@webank/letgo-common';
import { IEnumCodeType, IPublicEnumPageLifecycle } from '@webank/letgo-types';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { RendererProps } from '../core';
import type { CodeImplType } from '../code-impl/code-impl';
import { useCodesInstance } from '../code-impl/code-impl';
import { JavascriptFunctionLive } from '../code-impl';
import { getGlobalContextKey } from './context';

export function createExecuteContext(props: RendererProps) {
    const executeCtx: Record<string, any> = { };

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

    onBeforeMount(async () => {
        await Promise.all(Object.keys(executeCtx).map(async (id) => {
            const ins = executeCtx[id];
            if (ins.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.BeforeMount)
                    await ins.run();
            }
        }));
    });

    onMounted(() => {
        Object.keys(executeCtx).forEach((id) => {
            const ins = executeCtx[id];
            if (ins.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.Mounted)
                    ins.run();
                ins.run();
            }
        });
    });

    onBeforeUnmount(() => {
        Object.keys(executeCtx).forEach((id) => {
            const ins = executeCtx[id];
            if (ins.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.BeforeUnMount)
                    ins.run();
            }
        });
    });

    onUnmounted(() => {
        Object.keys(executeCtx).forEach((id) => {
            const ins = executeCtx[id];
            if (ins.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.UnMounted)
                    ins.run();
            }
        });
    });

    return {
        executeCtx,
        onCompGetCtx,
    };
}
