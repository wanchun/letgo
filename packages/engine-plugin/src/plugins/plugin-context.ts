import type { Logger } from '@harrywan/letgo-common';
import { getLogger } from '@harrywan/letgo-common';
import type { Editor, EngineConfig } from '@harrywan/letgo-editor-core';
import { engineConfig } from '@harrywan/letgo-editor-core';
import type { Designer } from '@harrywan/letgo-designer';
import { Hotkey, Material, Project, Setters, Skeleton } from '../shell';
import type {
    IPluginContext,
    IPluginContextOptions,
    IPluginManager,
    IPluginPreferenceDeclaration,
    IPluginPreferenceManager,
    IPreferenceValueType,
} from './plugin-types';
import { isValidPreferenceKey } from './plugin-utils';

export class PluginContext implements IPluginContext {
    editor: Editor;
    designer: Designer;
    skeleton: Skeleton;
    hotkey: Hotkey;
    logger: Logger;
    plugins: IPluginManager;
    setters: Setters;
    config: EngineConfig;
    material: Material;
    project: Project;
    preference: IPluginPreferenceManager;

    constructor(plugins: IPluginManager, options: IPluginContextOptions) {
        const editor = plugins.editor;
        const designer = plugins.designer;
        const skeleton = plugins.skeleton;
        const { pluginName = 'anonymous' } = options;
        const project = designer?.project;
        this.editor = editor;
        this.designer = designer;
        this.hotkey = new Hotkey();
        this.project = new Project(project);
        this.skeleton = new Skeleton(skeleton);
        this.setters = new Setters();
        this.material = new Material(this.editor, designer);
        this.config = engineConfig;
        this.plugins = plugins;
        this.logger = getLogger({
            level: 'warn',
            bizName: `designer:plugin:${pluginName}`,
        });

        const enhancePluginContextHook = engineConfig.get(
            'enhancePluginContextHook',
        );
        if (enhancePluginContextHook)
            enhancePluginContextHook(this);
    }

    setPreference(
        pluginName: string,
        preferenceDeclaration: IPluginPreferenceDeclaration,
    ): void {
        const getPreferenceValue = (
            key: string,
            defaultValue?: IPreferenceValueType,
        ): IPreferenceValueType | undefined => {
            if (!isValidPreferenceKey(key, preferenceDeclaration))
                return undefined;

            const pluginPreference
                = this.plugins.getPluginPreference(pluginName) || {};
            if (
                pluginPreference[key] === undefined
                || pluginPreference[key] === null
            )
                return defaultValue;

            return pluginPreference[key];
        };

        this.preference = {
            getPreferenceValue,
        };
    }
}
