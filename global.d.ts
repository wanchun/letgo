import { StyleValue, CSSProperties } from 'vue'
export { };

declare global {
    namespace JSX {
        interface IntrinsicAttributes {
            onClick?: (event: MouseEvent) => void
        }
    }
}
