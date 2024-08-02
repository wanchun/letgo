declare const ENGINE_VERSION_PLACEHOLDER: string;
declare const ENGINE_EXT_VERSION_PLACEHOLDER: string;

export {};

declare global {
    namespace JSX {
        interface IntrinsicAttributes {
            onClick?: (event: MouseEvent) => void;
            onMousedown?: (event: MouseEvent) => void;
        }
    }
    interface Window {
        letgoRequest: <T>(url: string, params: string | Record<string, any> | Blob | File | FormData | ArrayBuffer | URLSearchParams | DataView) => Promise<T>;
    }
}
