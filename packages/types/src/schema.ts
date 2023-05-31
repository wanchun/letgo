import type {
    IPublicTypeCompositeObject,
    IPublicTypeCompositeValue,
    IPublicTypeJSExpression,
    IPublicTypeJSONObject,
} from './value-type';
import type { IPublicTypeComponentsMap } from './npm';
import type { IPublicTypeUtilsMap } from './utils';
import type { IPublicTypeAppConfig } from './app-config';
import type { CodeStruct } from './code';
import type { IPublicTypeComponentEvent } from './component-event';

export interface IPublicTypeDirective {
    name: string
    value: IPublicTypeCompositeValue
    arg?: IPublicTypeCompositeValue
    modifiers: string[]
}

/**
 * 搭建基础协议 - 单个组件树节点描述
 */
export interface IPublicTypeNodeSchema {
    id?: string
    /**
     * 组件 ref
     */
    ref?: string
    /**
     * 组件名称 必填、首字母大写
     */
    componentName: string
    /**
     * 组件中文名
     */
    title?: string
    /**
     * 组件描述
     */
    description?: string
    /**
     * 组件属性对象
     */
    props?: {
        children?: IPublicTypeNodeData | IPublicTypeNodeData[]
    } & IPublicTypePropsMap
    events?: IPublicTypeComponentEvent[]
    /**
     * 组件指令数组
     */
    directives?: IPublicTypeDirective[]
    /**
     * 渲染条件
     */
    condition?: IPublicTypeCompositeValue
    /**
     * 显示条件
     */
    visible?: IPublicTypeCompositeValue
    /**
     * 循环数据
     */
    loop?: IPublicTypeCompositeValue
    /**
     * 循环迭代对象、索引名称 ["item", "index"]
     */
    loopArgs?: [string, string]
    /**
     * 子节点
     */
    children?: IPublicTypeNodeData | IPublicTypeNodeData[]
}

export type IPublicTypePropsMap = IPublicTypeCompositeObject;
export type IPublicTypePropsList = Array<{
    name?: string
    value: IPublicTypeCompositeValue
}>;

export type IPublicTypeNodeData = IPublicTypeNodeSchema | IPublicTypeJSExpression | IPublicTypeDOMText;

export function isDOMText(data: any): data is IPublicTypeDOMText {
    return typeof data === 'string';
}

export type IPublicTypeDOMText = string;

/**
 * 容器结构描述
 */
export interface IPublicTypeContainerSchema extends IPublicTypeNodeSchema {
    /**
     * 'Block' | 'Page' | 'Component';
     */
    componentName: string
    /**
     * 文件名称
     */
    fileName: string
    /**
     * 代码
     */
    code: CodeStruct
    /**
     * 样式文件
     */
    css?: string
    /**
     * 低代码业务组件默认属性
     */
    defaultProps?: IPublicTypeCompositeObject
}

/**
 * 页面容器
 */
export interface IPublicTypePageSchema extends IPublicTypeContainerSchema {
    componentName: 'Page'
}

/**
 * 低代码业务组件容器
 */
export interface IPublicTypeComponentSchema extends IPublicTypeContainerSchema {
    componentName: 'Component'
}

/**
 * 区块容器
 */
export interface IPublicTypeBlockSchema extends IPublicTypeContainerSchema {
    componentName: 'Block'
}

/**
 * Slot schema 描述
 */
export interface IPublicTypeSlotSchema extends IPublicTypeNodeSchema {
    componentName: 'Slot'
    props?: {
        slotTitle?: string
        slotName?: string
        slotParams?: string[]
    }
    children?: IPublicTypeNodeData[] | IPublicTypeNodeData
}

export type IPublicTypeRootSchema = IPublicTypePageSchema | IPublicTypeComponentSchema | IPublicTypeBlockSchema;

/**
 * 应用描述
 */
export interface IPublicTypeProjectSchema {
    id?: string
    /**
     * 当前应用协议版本号
     */
    version: string
    /**
     * 当前应用所有组件映射关系
     */
    componentsMap: IPublicTypeComponentsMap
    /**
     * 描述应用所有页面、低代码组件的组件树
     * 低代码业务组件树描述
     * 是长度固定为1的数组, 即数组内仅包含根容器的描述（低代码业务组件容器类型）
     */
    componentsTree: IPublicTypeRootSchema[]
    /**
     * 应用范围内的全局自定义函数或第三方工具类扩展
     */
    utils?: IPublicTypeUtilsMap
    /**
     * 应用范围内的全局常量
     */
    constants?: IPublicTypeJSONObject
    /**
     * 应用范围内的全局样式
     */
    css?: string
    /**
     * 当前应用配置信息
     */
    config?: IPublicTypeAppConfig
    /**
     * 当前应用元数据信息
     */
    meta?: Record<string, any>
}

export function isNodeSchema(data: any): data is IPublicTypeNodeSchema {
    return data && data.componentName;
}

export function isSlotSchema(data: any): data is IPublicTypeSlotSchema {
    return data && data.componentName && data.componentName === 'Slot';
}

export function isProjectSchema(data: any): data is IPublicTypeProjectSchema {
    return data && data.componentsTree;
}
