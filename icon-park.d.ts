export {};

declare module 'vue' {
    interface AllowedComponentProps {
        onClick?: (event?: MouseEvent) => void;
        onMouseDown?: (event?: MouseEvent) => void;
    }
}
