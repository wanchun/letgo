import type { IPublicTypeComponentInstance } from '@webank/letgo-types';
import { isNil, isObject } from 'lodash-es';
import type { ComponentInternalInstance, VNode } from 'vue';

export interface VNodeHTMLElement extends HTMLElement {
    __vnode: VNode;
    __vueParentComponent: ComponentInternalInstance;
}

export function isVNodeHTMLElement(el: unknown): el is VNodeHTMLElement {
    return (
        isObject(el)
        && '__vueParentComponent' in el
        && !isNil(el.__vueParentComponent)
    );
}

export function getVueInstance(instanceOrEl: IPublicTypeComponentInstance | HTMLElement) {
    let instance;
    if ('$' in instanceOrEl)
        instance = instanceOrEl;

    else if (isVNodeHTMLElement(instanceOrEl))
        instance = instanceOrEl.__vueParentComponent.proxy!;

    return instance;
}
