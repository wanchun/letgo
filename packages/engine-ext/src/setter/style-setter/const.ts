import type { InjectionKey } from 'vue';

export const styleKey: InjectionKey<{
    style: CSSStyleDeclaration | null
}> = Symbol('style');
