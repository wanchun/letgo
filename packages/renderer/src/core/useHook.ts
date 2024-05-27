import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted } from 'vue';
import { IEnumCodeType, IPublicEnumPageLifecycle } from '@webank/letgo-types';
import type { LifecycleHookLive } from '../code-impl';

export function useHook(hooks: Record<string, LifecycleHookLive>) {
    onBeforeMount(async () => {
        await Promise.all(Object.keys(hooks).map(async (id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.BeforeMount)
                    await ins.run();
            }
        }));
    });

    onMounted(() => {
        Object.keys(hooks).forEach((id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.Mounted)
                    ins.run();
            }
        });
    });

    onBeforeUnmount(() => {
        Object.keys(hooks).forEach((id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.BeforeUnMount)
                    ins.run();
            }
        });
    });

    onUnmounted(() => {
        Object.keys(hooks).forEach((id) => {
            const ins = hooks[id];
            if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                if (ins.hookName === IPublicEnumPageLifecycle.UnMounted)
                    ins.run();
            }
        });
    });
}
