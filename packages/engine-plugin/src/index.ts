import type { IPluginConfig } from './types';

export * from './plugins';
export * from './shell';
export * from './utils';
export * from './types';

export function definePlugin(plugin: IPluginConfig) {
    return plugin;
}
