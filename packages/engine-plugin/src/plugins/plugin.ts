import { EventEmitter } from 'eventemitter3';
import type { Logger } from '@webank/letgo-common';
import { getLogger } from '@webank/letgo-common';
import { invariant } from '../utils';
import type {
    IPlugin,
    IPluginConfig,
    IPluginConfigMeta,
    IPluginContext,
    IPluginManager,
} from '../types';

export class Plugin implements IPlugin {
    config: IPluginConfig;

    logger: Logger;

    private manager: IPluginManager;

    private emitter = new EventEmitter();

    private _inited: boolean;

    private pluginName: string;

    private meta: IPluginConfigMeta;

    /**
     * 标识插件状态，是否被 disabled
     */
    private _disabled: boolean;

    private _ctx: IPluginContext;

    private _options: any;

    constructor(
        pluginName: string,
        manager: IPluginManager,
        config: IPluginConfig,
        meta: IPluginConfigMeta,
        ctx: IPluginContext,
        options: any,
    ) {
        this.manager = manager;
        this.config = config;
        this.pluginName = pluginName;
        this.meta = meta;
        this.logger = getLogger({
            belong: `plugin:${pluginName}`,
        });
        this._ctx = ctx;
        this._options = options;
    }

    get name() {
        return this.pluginName;
    }

    get dep() {
        if (typeof this.meta.dependencies === 'string')
            return [this.meta.dependencies];

        return this.meta.dependencies || [];
    }

    get disabled() {
        return this._disabled;
    }

    on(event: string | symbol, listener: (...args: any[]) => void): any {
        this.emitter.on(event, listener);
        return () => {
            this.emitter.off(event, listener);
        };
    }

    emit(event: string | symbol, ...args: any[]) {
        return this.emitter.emit(event, ...args);
    }

    removeAllListeners(event: string | symbol): any {
        return this.emitter.removeAllListeners(event);
    }

    isInit() {
        return this._inited;
    }

    async init(forceInit?: boolean) {
        if (this._inited && !forceInit)
            return;
        await this.config.init?.call(undefined, this._ctx, this._options);
        this._inited = true;
    }

    async destroy() {
        if (!this._inited)
            return;
        await this.config?.destroy?.call(undefined, this._ctx, this._options);
        this._inited = false;
    }

    setDisabled(flag = true) {
        this._disabled = flag;
    }

    toProxy() {
        invariant(this._inited, 'Could not call toProxy before init');
        const exports = this.config.exports?.();
        return new Proxy(this, {
            get(target, prop, receiver) {
                if ({}.hasOwnProperty.call(exports, prop))
                    return exports?.[prop as string];

                return Reflect.get(target, prop, receiver);
            },
        });
    }

    async dispose() {
        await this.manager.delete(this.name);
    }
}
