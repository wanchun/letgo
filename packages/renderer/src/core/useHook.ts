import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted } from 'vue';
import { IEnumCodeType, IPublicEnumPageLifecycle } from '@webank/letgo-types';
import type { LifecycleHookLive } from '../code-impl';

export function useHook(hooks: Record<string, any>) {
    onBeforeMount(async () => {
        await Promise.all(Object.keys(hooks).map(async (id) => {
            const ins = hooks[id] as LifecycleHookLive;
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.BeforeMount)
                    await ins.run();
            }
        }));
        if (hooks.__this && typeof hooks.__this[IPublicEnumPageLifecycle.BeforeMount] === 'function')
            hooks.__this[IPublicEnumPageLifecycle.BeforeMount]();
    });

    onMounted(() => {
        Object.keys(hooks).forEach((id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.Mounted)
                    ins.run();
            }
        });
        if (hooks.__this && typeof hooks.__this[IPublicEnumPageLifecycle.Mounted] === 'function')
            hooks.__this[IPublicEnumPageLifecycle.Mounted]();
    });

    onBeforeUnmount(() => {
        Object.keys(hooks).forEach((id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.BeforeUnMount)
                    ins.run();
            }
        });
        if (hooks.__this && typeof hooks.__this[IPublicEnumPageLifecycle.BeforeUnMount] === 'function')
            hooks.__this[IPublicEnumPageLifecycle.BeforeUnMount]();
    });

    onUnmounted(() => {
        Object.keys(hooks).forEach((id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.UnMounted)
                    ins.run();
            }
        });
        if (hooks.__this && typeof hooks.__this[IPublicEnumPageLifecycle.UnMounted] === 'function')
            hooks.__this[IPublicEnumPageLifecycle.UnMounted]();
    });
}
