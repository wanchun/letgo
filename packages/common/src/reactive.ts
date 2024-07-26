import { computed, reactive, shallowReactive } from 'vue';
import { getAllMethodAndProperties } from './utils';

export function markClassReactive(target: object, filter?: (key: string) => boolean) {
    const members = getAllMethodAndProperties(target).filter((member) => {
        if (filter)
            return filter(member);

        return true;
    });

    const state = reactive<Record<string, any>>(members.reduce((acc, cur) => {
        acc[cur] = target[cur as keyof typeof target];
        return acc;
    }, {} as Record<string, any>));
    members.forEach((key) => {
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

export function markShallowReactive(target: Record<string, any>, properties: Record<string, any>) {
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

export function markReactive(target: Record<string, any>, properties: Record<string, any>) {
    const state = reactive(properties);
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
