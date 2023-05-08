import type { INode } from '../types';

export function includeSlot(node: INode, slotName: string | undefined): boolean {
    const { slots = [] } = node;
    return slots.some((slot) => {
        return (
            slotName && slotName === slot?.getExtraProp('name')?.getAsString()
        );
    });
}

export function removeSlot(node: INode, slotName: string | undefined): boolean {
    const { slots = [] } = node;
    return slots.some((slot, idx) => {
        if (
            slotName
            && slotName === slot?.getExtraProp('name')?.getAsString()
        ) {
            slot.remove();
            slots.splice(idx, 1);
            return true;
        }
        return false;
    });
}
