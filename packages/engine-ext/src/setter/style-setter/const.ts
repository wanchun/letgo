import type { InjectionKey } from 'vue';

export const styleKey: InjectionKey<{
    style: Record<string, any> | null
}> = Symbol('style');
