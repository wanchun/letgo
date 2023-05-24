import {StyleValue, CSSProperties} from 'vue'
export {};

declare global {
    namespace JSX {
        interface IntrinsicAttributes {
            style?: StyleValue
            class?: CSSProperties
        }
    }
}
