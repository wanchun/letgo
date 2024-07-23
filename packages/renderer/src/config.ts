import type { Component } from 'vue';
import type { Logger } from '@webank/letgo-common';
import { RENDERER_COMPS } from './renderers';

export type RendererModules = Record<string, Component>;

export class Config {
    private logger: Logger;
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

    setLogger(logger: Logger) {
        this.logger = logger;
    }

    logWarn(err: unknown, infoCtx?: Record<string, any>) {
        if (this.logger) {
            this.logger.warn({
                msg: err,
                ...infoCtx,
            });
        }
        else {
            // eslint-disable-next-line no-console
            console.log('error context: ', infoCtx);
            console.warn(err);
        }
    }

    logError(err: unknown, infoCtx?: Record<string, any>) {
        if (this.logger) {
            this.logger.error({
                msg: err,
                ...infoCtx,
            });
        }
        else {
            // eslint-disable-next-line no-console
            console.log('error context: ', infoCtx);
            console.error(err);
        }
    }
}

export default new Config();
