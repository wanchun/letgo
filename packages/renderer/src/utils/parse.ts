import { ensureArray } from './array';
import type { BlockScope } from './scope';

export function parseSlotScope(args: unknown[], params: string[]): BlockScope {
    const slotParams: BlockScope = {};
    ensureArray(params).forEach((item, idx) => {
        slotParams[item] = args[idx];
    });
    return slotParams;
}
