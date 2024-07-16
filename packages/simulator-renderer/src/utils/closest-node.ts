import type { INodeInstance } from '@webank/letgo-designer';
import { isVNodeHTMLElement } from '@webank/letgo-renderer';
import type { ComponentInternalInstance } from 'vue';
import {
    ComponentRecord,
    getCompRootData,
    isCompRootHTMLElement,
} from './comp-node';

export function getClosestNodeInstance(
    el: Element,
    specId: string | undefined,
): INodeInstance<ComponentRecord> | null {
    if (!document.contains(el))
        return null;

    return getClosestNodeInstanceByElement(el, specId);
}

export function getClosestNodeInstanceByComponent(
    instance: ComponentInternalInstance | null,
    specId: string | undefined,
): INodeInstance<ComponentRecord> | null {
    while (instance) {
        const el = instance.vnode.el as Element;
        if (el && isCompRootHTMLElement(el)) {
            const { nodeId, docId, instance } = getCompRootData(el);
            if (!specId || specId === nodeId) {
                return {
                    docId,
                    nodeId,
                    instance: new ComponentRecord(
                        docId,
                        nodeId,
                        instance.$.uid,
                    ),
                };
            }
        }
        instance = instance.parent;
    }
    return null;
}

export function getClosestNodeInstanceByElement(
    el: Element,
    specId: string | undefined,
): INodeInstance<ComponentRecord> | null {
    while (el) {
        if (isVNodeHTMLElement(el)) {
            const component = el.__vueParentComponent;
            return getClosestNodeInstanceByComponent(component, specId);
        }
        if (isCompRootHTMLElement(el)) {
            const { nodeId, docId, instance } = getCompRootData(el);
            if (!specId || specId === nodeId) {
                return {
                    docId,
                    nodeId,
                    instance: new ComponentRecord(
                        docId,
                        nodeId,
                        instance.$.uid,
                    ),
                };
            }
        }
        el = el.parentElement as Element;
    }
    return null;
}
