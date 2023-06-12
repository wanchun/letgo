import type { Component } from 'vue';
import { PageRenderer } from './page';
import { IconRenderer } from './icon';

export const RENDERER_COMPS: Record<string, Component> = {
    PageRenderer,
    IconRenderer,
};
