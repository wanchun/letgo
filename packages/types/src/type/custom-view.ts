import type { Slot } from 'vue';

export type IPublicTypeCustomView = Slot;

export function isCustomView(obj: any): obj is IPublicTypeCustomView {
    return obj && typeof obj === 'function';
}
