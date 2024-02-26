import type { Component } from 'vue';
import { PageRenderer } from './page';
import { ComponentRenderer } from './component';

export const RENDERER_COMPS: Record<string, Component> = {
    ComponentRenderer,
    PageRenderer,
};
