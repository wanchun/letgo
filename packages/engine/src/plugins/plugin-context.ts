import { Logger, getLogger } from '@webank/letgo-utils';
import { EngineConfig, Editor, engineConfig } from '@webank/letgo-editor-core';
import { Designer } from '@webank/letgo-designer';
import { Skeleton, Hotkey, Setters, Project, Material } from '../shell';
import {
    IPluginContext,
    IPluginManager,
    IPluginPreferenceManager,
    IPluginContextOptions,
    IPluginPreferenceDeclaration,
    PreferenceValueType,
} from './plugin-types';
import { isValidPreferenceKey } from './plugin-utils';

export default class PluginContext implements IPluginContext {
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
        const { pluginName = 'anonymous' } = options;
        const designer = editor.get('designer');
        const skeleton = editor.get('skeleton');
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
        if (enhancePluginContextHook) {
            enhancePluginContextHook(this);
        }
    }

    setPreference(
        pluginName: string,
        preferenceDeclaration: IPluginPreferenceDeclaration,
    ): void {
        const getPreferenceValue = (
            key: string,
            defaultValue?: PreferenceValueType,
        ): PreferenceValueType | undefined => {
            if (!isValidPreferenceKey(key, preferenceDeclaration)) {
                return undefined;
            }
            const pluginPreference =
                this.plugins.getPluginPreference(pluginName) || {};
            if (
                pluginPreference[key] === undefined ||
                pluginPreference[key] === null
            ) {
                return defaultValue;
            }
            return pluginPreference[key];
        };

        this.preference = {
            getPreferenceValue,
        };
    }
}
