import { getGlobalContextKey } from '@webank/letgo-renderer';
import type { RendererContext as LiveRendererContext, RuntimeScope } from '@webank/letgo-renderer';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { InjectionKey } from 'vue';

interface RendererContext extends LiveRendererContext {
    onCompGetCtx(schema: IPublicTypeNodeSchema, val: IPublicTypeComponentInstance, scope?: RuntimeScope): void
}

function getPageContextKey(): InjectionKey<RendererContext> {
    let context = (window as any).__pageContext;
    if (!context) {
        context = Symbol('__pageContext');
        (window as any).__pageContext = context;
    }
    return context;
}

export const BASE_COMP_CONTEXT = getPageContextKey();
export const BASE_GLOBAL_CONTEXT = getGlobalContextKey();
