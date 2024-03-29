import type { Component } from 'vue';
import { RENDERER_COMPS } from './renderers';

export type RendererModules = Record<string, Component>;

export class Config {
    private renderers: RendererModules = { ...RENDERER_COMPS };
    private configProvider: any = null;

    setConfigProvider(comp: any) {
        this.configProvider = comp;
    }

    getConfigProvider() {
        return this.configProvider;
    }

    setRenderers(renderers: RendererModules) {
        this.renderers = renderers;
    }

    getRenderers() {
        return this.renderers;
    }
}

export default new Config();
