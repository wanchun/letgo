import { ref } from 'vue';

type ClassFieldDecorator = (
    value: undefined,
    context: {
        kind: 'field'
        name: string | symbol
        static: boolean
        private: boolean
        access: { get: () => unknown; set: (value: unknown) => void }
    }
) => (initialValue: unknown) => unknown | void;

type ClassAutoAccessorDecorator = (
    value: {
        get: () => unknown
        set: (value: unknown) => void
    },
    context: {
        kind: 'accessor'
        name: string | symbol
        access: { get(): unknown; set(value: unknown): void }
        static: boolean
        private: boolean
        addInitializer(initializer: () => void): void
    }
) => {
    get?: () => unknown
    set?: (value: unknown) => void
    init?: (initialValue: unknown) => unknown
} | void;

type ClassDecorator = (
    value: Function,
    context: {
        kind: 'method'
        name: string | symbol
        static: boolean
        private: boolean
        access: { get: () => unknown }
        addInitializer(initializer: () => void): void
    }
) => Function | void;

type ClassGetterDecorator = (
    value: Function,
    context: {
        kind: 'getter'
        name: string | symbol
        static: boolean
        private: boolean
        access: { get: () => unknown }
        addInitializer(initializer: () => void): void
    }
) => Function | void;

type ClassSetterDecorator = (
    value: Function,
    context: {
        kind: 'setter'
        name: string | symbol
        static: boolean
        private: boolean
        access: { set: (value: unknown) => void }
        addInitializer(initializer: () => void): void
    }
) => Function | void;

export const useRef: ClassAutoAccessorDecorator = (value, context) => {
    if (context.kind === 'accessor') {
        const valueRef = ref();
        return {
            get() {
                return valueRef.value;
            },

            set(val) {
                if (val !== valueRef.value)
                    valueRef.value = val;

                return val;
            },

            init(initialValue) {
                return initialValue;
            },
        };
    }
};
