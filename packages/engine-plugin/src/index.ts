import type { IPluginConfig } from './plugins';

export * from './plugins';
export * from './shell';
export * from './utils'; ;

export function definePlugin(plugin: IPluginConfig) {
    return plugin;
}
