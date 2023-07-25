import { inject, provide, shallowRef, triggerRef } from 'vue';
import type { InjectionKey, VNodeChild } from 'vue';

interface Popup {
    id: number
    title: string
    nodes: VNodeChild
    zIndex: number
}

let zIndex = 1;

export const INJECTION_KEY: InjectionKey<{
    openPopup: (title: string, nodes: VNodeChild, onClose?: () => void) => void
    closePopup: () => void
}>
    = Symbol('popup');

export function usePopup() {
    const popupList = shallowRef<Popup[]>([]);

    const openPopup = (title: string, nodes: VNodeChild, onClose?: () => void) => {
        popupList.value.push({
            id: Date.now(),
            title,
            nodes,
            zIndex: zIndex++,

        });
        triggerRef(popupList);
        onClose?.();
    };

    const closePopup = () => {
        popupList.value.splice(popupList.value.length - 1, 1);
        triggerRef(popupList);
    };

    provide(INJECTION_KEY, {
        openPopup,
        closePopup,
    });

    return {
        popupList,
        closePopup,
    };
}

export function usePopupManage() {
    return inject(INJECTION_KEY);
}
