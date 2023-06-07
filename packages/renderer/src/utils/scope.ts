import type { ComponentPublicInstance } from 'vue';
import { isProxy, reactive } from 'vue';
import { isPlainObject } from 'lodash-es';
import type { MaybeArray } from './array';
import { ensureArray } from './array';

export interface BlockScope {
    [x: string]: unknown
}

export interface RuntimeScope extends BlockScope, ComponentPublicInstance {
    currentLocale: string
    __loopScope?: boolean
    __loopRefIndex?: number
    __loopRefOffset?: number
}

function isRuntimeScope(scope: any): scope is RuntimeScope {
    return '$' in scope;
}

function isValidScope(scope: unknown): scope is BlockScope | RuntimeScope {
    // 为 null、undefined，或者不是对象
    if (!scope || !isPlainObject(scope))
        return false;

    // runtime scope
    if (isRuntimeScope(scope))
        return true;

    // scope 属性不为空
    if (Object.keys(scope).length > 0)
        return true;
    return false;
}

export function mergeScope(
    scope: RuntimeScope,
    ...blockScope: MaybeArray<BlockScope | undefined | null>[]
): RuntimeScope;
export function mergeScope(
    ...blockScope: MaybeArray<BlockScope | undefined | null>[]
): BlockScope;
export function mergeScope(
    ...scopes: MaybeArray<RuntimeScope | BlockScope | undefined | null>[]
): RuntimeScope | BlockScope {
    const normalizedScope: (RuntimeScope | BlockScope)[] = [];
    scopes.flat().forEach((scope) => {
        if (isValidScope(scope))
            normalizedScope.push(scope);
    });

    if (normalizedScope.length <= 1)
        return normalizedScope[0];

    const [rootScope, ...resScopes] = normalizedScope;
    return resScopes.reduce((result, scope) => {
        if (isRuntimeScope(scope)) {
            if (!isRuntimeScope(result)) {
                const temp = result;
                result = scope;
                scope = temp;
            }
            else {
                return scope;
            }
        }

        const descriptors = Object.getOwnPropertyDescriptors(scope);
        result = Object.create(result, descriptors);
        return isProxy(scope) ? reactive(result) : result;
    }, rootScope);
}

export function parseSlotScope(args: unknown[], params: string[]): BlockScope {
    const slotParams: BlockScope = {};
    ensureArray(params).forEach((item, idx) => {
        slotParams[item] = args[idx];
    });
    return slotParams;
}
