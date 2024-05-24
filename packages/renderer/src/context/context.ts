import type { Component, InjectionKey, ShallowRef } from 'vue';
import { inject, provide, shallowRef, watch } from 'vue';
import type { INode } from '@webank/letgo-designer';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { RendererProps } from '../core/base';
import { createExecuteContext } from './execute-context';

export interface RendererContext {
    executeCtx: Record<string, any>;
    onCompGetCtx: (schema: IPublicTypeNodeSchema, val: IPublicTypeComponentInstance) => void;
    readonly components?: ShallowRef<Record<string, Component>>;
    __BASE_COMP?: Component;
    getNode?: (id: string) => INode | null;
}

export function getGlobalContextKey(): InjectionKey<Record<string, any>> {
    let context = (window as any).__appContext;
    if (!context) {
        context = Symbol('__globalContext');
        (window as any).__appContext = context;
    }
    return context;
}

export function getPageContextKey(): InjectionKey<RendererContext> {
    let context = (window as any).__pageContext;
    if (!context) {
        context = Symbol('__pageContext');
        (window as any).__pageContext = context;
    }
    return context;
}

export function provideRenderContext(props: RendererProps, ctx?: RendererContext): RendererContext {
    const contextKey = getPageContextKey();

    const componentsRef = shallowRef<Record<string, Component>>(props.__components);
    watch(() => props.__components, () => {
        componentsRef.value = props.__components;
    });
    const externalContext = ctx || inject(contextKey, () => {
        return createExecuteContext(props);
    }, true);

    const newCtx = Object.assign({
        __BASE_COMP: props.__components.__BASE_COMP,
        components: componentsRef,
    }, externalContext);

    provide(
        contextKey,
        newCtx,
    );

    return newCtx;
}

export function useRendererContext() {
    const key = getPageContextKey();
    return inject(key);
}
