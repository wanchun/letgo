import type { Logger } from '@webank/letgo-utils';
import type { Editor, EngineConfig } from '@webank/letgo-editor-core';
import type { Designer } from '@webank/letgo-designer';
import type { Skeleton as InnerSkeleton } from '@webank/letgo-editor-skeleton';
import type { IPublicTypeCompositeObject } from '@webank/letgo-types';
import type { Hotkey, Material, Project, Setters, Skeleton } from '../shell';

export type IPreferenceValueType = string | number | boolean;

export interface IPluginPreferenceDeclarationProperty {
    // shape like 'name' or 'group.name' or 'group.subGroup.name'
    key: string
    // must have either one of description & markdownDescription
    description: string
    // value in 'number', 'string', 'boolean'
    type: string
    // default value
    // NOTE! this is only used in configuration UI, won`t affect runtime
    default?: IPreferenceValueType
    // only works when type === 'string', default value false
    useMultipleLineTextInput?: boolean
    // enum values, only works when type === 'string'
    enum?: any[]
    // descriptions for enum values
    enumDescriptions?: string[]
    // message that describing deprecation of this property
    deprecationMessage?: string
}

export interface IPluginPreferenceDeclaration {
    // this will be displayed on configuration UI, can be plugin name
    title: string
    properties: IPluginPreferenceDeclarationProperty[]
}

export type IPluginPreference = Map<string, Record<string, IPreferenceValueType>>;

export interface IPluginConfigMetaEngineConfig {
    version?: string
}

export interface IPluginConfigMeta {
    preferenceDeclaration?: IPluginPreferenceDeclaration
    // 依赖插件名
    dependencies?: string[]
    engines?: IPluginConfigMetaEngineConfig
}

export interface IPluginPreferenceManager {

    getPreferenceValue: (
        key: string,
        defaultValue?: IPreferenceValueType,
    ) => IPreferenceValueType | undefined
}

export interface IPluginContext {
    editor: Editor
    designer: Designer
    skeleton: Skeleton
    hotkey: Hotkey
    logger: Logger
    plugins: IPluginManager
    setters: Setters
    config: EngineConfig
    material: Material
    project: Project
    preference: IPluginPreferenceManager
}

export interface IPluginConfig {
    name: string
    init: (ctx: IPluginContext, options: any) => void
    meta?: IPluginConfigMeta
    dep?: string | string[]
    destroy?(): void
    exports?(): any
}

export interface IPluginCore {
    name: string
    dep: string[]
    disabled: boolean
    config: IPluginConfig
    logger: Logger
    on(event: string | symbol, listener: (...args: any[]) => void): any
    emit(event: string | symbol, ...args: any[]): boolean
    removeAllListeners(event?: string | symbol): this
    init(forceInit?: boolean): void
    isInit(): boolean
    destroy(): void
    toProxy(): any
    setDisabled(flag: boolean): void
}

interface IPluginExportsAccessor {
    [propName: string]: any
}

export type IPlugin = IPluginCore & IPluginExportsAccessor;

export interface IPluginManagerCore {
    editor: Editor
    designer: Designer
    skeleton: InnerSkeleton
    register(
        pluginConfig: IPluginConfig,
        pluginOptions?: any,
        registerOptions?: IPublicTypeCompositeObject,
    ): Promise<void>
    init(
        pluginPreference?: Map<string, Record<string, IPreferenceValueType>>,
    ): Promise<void>
    get(pluginName: string): IPlugin | undefined
    getAll(): IPlugin[]
    has(pluginName: string): boolean
    delete(pluginName: string): any
    setDisabled(pluginName: string, flag: boolean): void
    dispose(): void
}

interface IPluginManagerPluginAccessor {
    [pluginName: string]: IPlugin | any
}

export type IPluginManager = IPluginManagerCore & IPluginManagerPluginAccessor;

export interface IPluginRegisterOptions {
    autoInit?: boolean
    // allow overriding existing plugin with same name when override === true
    override?: boolean
}

export function isPluginRegisterOptions(
    opts: any,
): opts is IPluginRegisterOptions {
    return opts && ('autoInit' in opts || 'override' in opts);
}

export interface IPluginContextOptions {
    pluginName: string
}
