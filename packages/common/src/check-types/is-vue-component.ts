import type { Component } from 'vue';
import { isFunction, isObject } from 'lodash-es';

export function isVueComponent(val: unknown): val is Component {
    if (isFunction(val))
        return true;
    if (isObject(val) && ('render' in val || 'setup' in val))
        return true;

    return false;
}
