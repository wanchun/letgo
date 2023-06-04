import type { Component, ComputedRef, InjectionKey } from 'vue';
import { computed, inject, provide } from 'vue';
import type { INode } from '@webank/letgo-designer';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { RendererProps } from '../core/base';
import { createExecuteContext } from './execute-context';

export interface RendererContext {
    readonly components?: ComputedRef<Record<string, Component>>
    getNode?(id: string): INode | null
    executeCtx: Record<string, any>
    onCompGetCtx(schema: IPublicTypeNodeSchema, val: IPublicTypeComponentInstance): void
}

export function contextFactory(): InjectionKey<RendererContext> {
    let context = (window as any).__appContext;
    if (!context) {
        context = Symbol('__appContext');
        (window as any).__appContext = context;
    }
    return context;
}

export function provideRenderContext(props: RendererProps) {
    const contextKey = contextFactory();

    const componentsRef = computed(() => props.__components);
    const externalContext = inject(contextKey, () => {
        return createExecuteContext(props);
    }, true);

    provide(
        contextKey,
        Object.assign({
            components: componentsRef,
        }, externalContext),
    );
}

export function useRendererContext() {
    const key = contextFactory();
    return inject(key);
}
