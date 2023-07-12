import type { Editor } from '@fesjs/letgo-editor-core';
import { editor, engineConfig } from '@fesjs/letgo-editor-core';
import { getLogger } from '@fesjs/letgo-common';
import semverSatisfies from 'semver/functions/satisfies';
import type { Designer } from '@fesjs/letgo-designer';
import type { Skeleton } from '@fesjs/letgo-editor-skeleton';
import { invariant } from '../utils';
import type {
    IPlugin,
    IPluginConfig,
    IPluginContextOptions,
    IPluginManager,
    IPluginPreference,
    IPluginPreferenceDeclaration,
    IPluginRegisterOptions,
    IPreferenceValueType,
} from './plugin-types';
import {
    isPluginRegisterOptions,
} from './plugin-types';
import { Plugin } from './plugin';
import { PluginContext } from './plugin-context';
import sequencify from './sequencify';

const logger = getLogger({ level: 'warn', bizName: 'engine:pluginManager' });

export class PluginManager implements IPluginManager {
    readonly editor: Editor;
    readonly designer: Designer;
    readonly skeleton: Skeleton;

    private plugins: IPlugin[] = [];

    private pluginsMap: Map<string, IPlugin> = new Map();

    private pluginPreference?: IPluginPreference = new Map();

    constructor(designer: Designer, skeleton: Skeleton) {
        this.editor = editor;
        this.designer = designer;
        this.skeleton = skeleton;
    }

    private _getPluginContext(options: IPluginContextOptions) {
        return new PluginContext(this, options);
    }

    isEngineVersionMatched(versionExp: string): boolean {
        const engineVersion = engineConfig.get('ENGINE_VERSION');
        // ref: https://github.com/npm/node-semver#functions
        // 1.0.1-beta should match '^1.0.0'
        return semverSatisfies(engineVersion, versionExp, {
            includePrerelease: true,
        });
    }

    /**
     * register a plugin
     * @param pluginConfigCreator - a creator function which returns the plugin config
     * @param options - the plugin options
     * @param registerOptions - the plugin register options
     */
    async register(
        pluginConfig: IPluginConfig,
        options?: any,
        registerOptions?: IPluginRegisterOptions,
    ): Promise<void> {
        // registerOptions maybe in the second place
        if (isPluginRegisterOptions(options)) {
            registerOptions = options;
            options = {};
        }
        const { name: pluginName, meta = {} } = pluginConfig;
        const { preferenceDeclaration, engines } = meta;
        const ctx = this._getPluginContext({ pluginName });
        invariant(pluginName, 'pluginConfig.pluginName required', pluginConfig);

        ctx.setPreference(
            pluginName,
            preferenceDeclaration as IPluginPreferenceDeclaration,
        );

        const allowOverride = registerOptions?.override === true;

        if (this.pluginsMap.has(pluginName)) {
            if (!allowOverride) {
                throw new Error(`Plugin with name ${pluginName} exists`);
            }
            else {
                // clear existing plugin
                const originalPlugin = this.pluginsMap.get(pluginName);
                logger.log(
                    'plugin override, originalPlugin with name ',
                    pluginName,
                    ' will be destroyed, config:',
                    originalPlugin?.config,
                );
                originalPlugin?.destroy();
                this.pluginsMap.delete(pluginName);
            }
        }

        const engineVersionExp = engines && engines.version;
        if (
            engineVersionExp
            && !this.isEngineVersionMatched(engineVersionExp)
        ) {
            throw new Error(
                `plugin ${pluginName} skipped, engine check failed, current engine version is ${engineConfig.get(
                    'ENGINE_VERSION',
                )}, meta.engines.version is ${engineVersionExp}`,
            );
        }

        const plugin = new Plugin(
            pluginName,
            this,
            pluginConfig,
            meta,
            ctx,
            options,
        );
        // support initialization of those plugins which registered after normal initialization by plugin-manager
        if (registerOptions?.autoInit)
            await plugin.init();

        this.plugins.push(plugin);
        this.pluginsMap.set(pluginName, plugin);
        logger.log(
            `plugin registered with pluginName: ${pluginName}, config: ${pluginConfig}, meta: ${meta}`,
        );
    }

    get(pluginName: string): IPlugin | undefined {
        return this.pluginsMap.get(pluginName);
    }

    getAll(): IPlugin[] {
        return this.plugins;
    }

    has(pluginName: string): boolean {
        return this.pluginsMap.has(pluginName);
    }

    async delete(pluginName: string): Promise<boolean> {
        const idx = this.plugins.findIndex(
            plugin => plugin.name === pluginName,
        );
        if (idx === -1)
            return false;
        const plugin = this.plugins[idx];
        await plugin.destroy();

        this.plugins.splice(idx, 1);
        return this.pluginsMap.delete(pluginName);
    }

    async init(pluginPreference?: IPluginPreference) {
        const pluginNames: string[] = [];
        const pluginObj: { [name: string]: IPlugin } = {};
        this.pluginPreference = pluginPreference;
        this.plugins.forEach((plugin) => {
            pluginNames.push(plugin.name);
            pluginObj[plugin.name] = plugin;
        });
        const { missingTasks, sequence } = sequencify(pluginObj, pluginNames);
        invariant(
            !missingTasks.length,
            'plugin dependency missing',
            missingTasks,
        );
        logger.log('load plugin sequence:', sequence);

        for (const pluginName of sequence) {
            try {
                await this.pluginsMap.get(pluginName)!.init();
            }
            catch (e) /* istanbul ignore next */ {
                logger.error(
                    `Failed to init plugin:${pluginName}, it maybe affect those plugins which depend on this.`,
                );
                logger.error(e);
            }
        }
    }

    async destroy() {
        for (const plugin of this.plugins)
            await plugin.destroy();
    }

    get size() {
        return this.pluginsMap.size;
    }

    getPluginPreference(
        pluginName: string,
    ): Record<string, IPreferenceValueType> | null | undefined {
        if (!this.pluginPreference)
            return null;

        return this.pluginPreference.get(pluginName);
    }

    toProxy() {
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (target.pluginsMap.has(prop as string)) {
                    // 禁用态的插件，直接返回 undefined
                    if (target.pluginsMap.get(prop as string)!.disabled)
                        return undefined;

                    return target.pluginsMap.get(prop as string)?.toProxy();
                }
                return Reflect.get(target, prop, receiver);
            },
        });
    }

    /* istanbul ignore next */
    setDisabled(pluginName: string, flag = true) {
        logger.warn(`plugin:${pluginName} has been set disable:${flag}`);
        this.pluginsMap.get(pluginName)?.setDisabled(flag);
    }

    async dispose() {
        await this.destroy();
        this.plugins = [];
        this.pluginsMap.clear();
    }
}
