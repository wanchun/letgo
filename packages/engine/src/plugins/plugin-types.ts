import { Logger } from '@webank/letgo-utils';
import { EngineConfig, Editor } from '@webank/letgo-editor-core';
import { Skeleton, Hotkey, Setters, Project, Material } from '../shell';

export type PreferenceValueType = string | number | boolean;

export interface IPluginPreferenceDeclarationProperty {
    // shape like 'name' or 'group.name' or 'group.subGroup.name'
    key: string;
    // must have either one of description & markdownDescription
    description: string;
    // value in 'number', 'string', 'boolean'
    type: string;
    // default value
    // NOTE! this is only used in configuration UI, won`t affect runtime
    default?: PreferenceValueType;
    // only works when type === 'string', default value false
    useMultipleLineTextInput?: boolean;
    // enum values, only works when type === 'string'
    enum?: any[];
    // descriptions for enum values
    enumDescriptions?: string[];
    // message that describing deprecation of this property
    deprecationMessage?: string;
}

export interface IPluginPreferenceDeclaration {
    // this will be displayed on configuration UI, can be plugin name
    title: string;
    properties: IPluginPreferenceDeclarationProperty[];
}

export interface IPluginConfigMeta {
    preferenceDeclaration?: IPluginPreferenceDeclaration;
    // 依赖插件名
    dependencies?: string[];
}

export interface IPluginPreferenceManager {
    // eslint-disable-next-line max-len
    getPreferenceValue: (
        key: string,
        defaultValue?: PreferenceValueType,
    ) => PreferenceValueType | undefined;
}

export interface IPluginContext {
    skeleton: Skeleton;
    hotkey: Hotkey;
    logger: Logger;
    plugins: IPluginManager;
    setters: Setters;
    config: EngineConfig;
    editor: Editor;
    material: Material;
    project: Project;
    preference: IPluginPreferenceManager;
}

export interface IPluginConfig {
    name: string;
    init: (ctx: IPluginContext, options: any) => void;
    meta: IPluginConfigMeta;
}

interface IPluginManagerPluginAccessor {
    [pluginName: string]: IPlugin | any;
}

export interface IPluginManagerCore {
    register(
        pluginConfig: IPluginConfig,
        pluginOptions?: any,
        registerOptions?: CompositeObject,
    ): Promise<void>;
    init(
        pluginPreference?: Map<string, Record<string, PreferenceValueType>>,
    ): Promise<void>;
    get(pluginName: string): ILowCodePlugin | undefined;
    getAll(): ILowCodePlugin[];
    has(pluginName: string): boolean;
    delete(pluginName: string): any;
    setDisabled(pluginName: string, flag: boolean): void;
    dispose(): void;
}

export type IPluginManager = IPluginManagerCore & IPluginManagerPluginAccessor;

export interface IPluginCore {
    name: string;
    dep: string[];
    disabled: boolean;
    config: IPluginConfig;
    logger: Logger;
    on(event: string | symbol, listener: (...args: any[]) => void): any;
    emit(event: string | symbol, ...args: any[]): boolean;
    removeAllListeners(event?: string | symbol): this;
    init(forceInit?: boolean): void;
    isInit(): boolean;
    destroy(): void;
    toProxy(): any;
    setDisabled(flag: boolean): void;
}

interface IPluginExportsAccessor {
    [propName: string]: any;
}

export type IPlugin = IPluginCore & IPluginExportsAccessor;
