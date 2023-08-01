import { StyleValue, CSSProperties } from 'vue'
export { };

declare global {
    namespace JSX {
        interface IntrinsicAttributes {
            onClick?: (event: MouseEvent) => void
        }
    }
    interface Window {
        letgoRequest<T>(url: string, params: string | Record<string, any> | Blob | File | FormData | ArrayBuffer | URLSearchParams | DataView): Promise<T>
    }
}
