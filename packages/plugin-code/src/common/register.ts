import type { DefineComponent } from 'vue';

export const CustomComponent: Record<string, DefineComponent> = {};

export function registerComponent(name: string, component: DefineComponent) {
    CustomComponent[name] = component;
}
