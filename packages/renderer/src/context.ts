import { inject, Component, InjectionKey, getCurrentInstance } from 'vue';

export type DesignMode = 'live' | 'design';

export interface RendererContext {
    readonly components: Record<string, Component>;
}

export function contextFactory(): InjectionKey<RendererContext> {
    let context = (window as any).__appContext;
    if (!context) {
        context = Symbol('__appContext');
        (window as any).__appContext = context;
    }
    return context;
}

export function useRendererContext() {
    const key = contextFactory();
    return inject(
        key,
        () => {
            const props = getCurrentInstance()?.props ?? {};
            return {
                components: getPropValue(
                    props,
                    'components',
                    {} as Record<string, Component>,
                ),
            };
        },
        true,
    );
}

function getPropValue<T>(
    props: Record<string, unknown>,
    key: string,
    defaultValue: T,
): T {
    return (props[key] || props[`__${key}`] || defaultValue) as T;
}
