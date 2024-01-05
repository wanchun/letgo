import type { Component } from 'vue';

export const CustomComponent: Record<string, Component> = {};

export function registerComponent(name: string, component: Component) {
    CustomComponent[name] = component;
}
