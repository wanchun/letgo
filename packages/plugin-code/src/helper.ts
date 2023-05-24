import { computed, shallowReactive } from 'vue';
import { EXPRESSION_REGEX } from './constants';

export function hasExpression(doc: string) {
    return EXPRESSION_REGEX.test(doc);
}

export function extractExpression(doc: string) {
    const result = new Set<string>();
    const regex = new RegExp(EXPRESSION_REGEX, 'gs');
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(doc)) !== null)
        result.add(match[1].trim());

    return Array.from(result).filter(Boolean);
}

export function replaceExpression(doc: string, callback: (pattern: string, expression: string) => string) {
    const regex = new RegExp(EXPRESSION_REGEX, 'gs');
    return doc.replace(regex, callback);
}

export function markReactive(target: Record<string, any>, properties: Record<string, any>) {
    const state = shallowReactive(properties);
    Object.keys(properties).forEach((key) => {
        Object.defineProperty(target, key, {
            get() {
                return state[key];
            },
            set(value) {
                state[key] = value;
            },
        });
    });
    return target;
}

export function markComputed(target: Record<string, any>, properties: string[]) {
    const prototype = Object.getPrototypeOf(target);
    properties.forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        if (descriptor?.get) {
            const tmp = computed(descriptor.get.bind(target));
            Object.defineProperty(target, key, {
                get() {
                    return tmp.value;
                },
            });
        }
    });
    return target;
}
