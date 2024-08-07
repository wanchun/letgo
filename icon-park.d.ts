export {};

declare module 'vue' {
    interface AllowedComponentProps {
        onClick?: (event?: MouseEvent) => void;
        onMousedown?: (event?: MouseEvent) => void;
    }
}
