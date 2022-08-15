import {
    CompositeValue,
    JSExpression,
    JSSlot,
    CompositeObject,
    JSONObject,
} from './value-type';
import { ComponentsMap } from './npm';
import { UtilsMap } from './utils';
import { AppConfig } from './app-config';

export interface Directive {
    name: string;
    value: CompositeValue;
    arg?: CompositeValue;
    modifiers: string[];
}

/**
 * 搭建基础协议 - 单个组件树节点描述
 */
export interface NodeSchema {
    id?: string;
    /**
     * 组件名称 必填、首字母大写
     */
    componentName: string;
    /**
     * 节点描述
     */
    description?: string;
    /**
     * 组件属性对象
     */
    props?: PropsMap;
    /**
     * 组件指令数组
     */
    directives: Directive[];
    /**
     * 渲染条件
     */
    condition?: CompositeValue;
    /**
     * 显示条件
     */
    visible?: CompositeValue;
    /**
     * 循环数据
     */
    loop?: CompositeValue;
    /**
     * 循环迭代对象、索引名称 ["item", "index"]
     */
    loopArgs?: [string, string];
    /**
     * 子节点
     */
    children?: NodeData[];
}

export type PropsMap = CompositeObject;
export type PropsList = Array<{
    name?: string;
    value: CompositeValue;
}>;

export type NodeData = NodeSchema | JSSlot | JSExpression | DOMText;
export type NodeDataType = NodeData | NodeData[];

export function isDOMText(data: any): data is DOMText {
    return typeof data === 'string';
}

export type DOMText = string;

/**
 * 容器结构描述
 */
export interface ContainerSchema extends NodeSchema {
    /**
     * 'Block' | 'Page' | 'Component';
     */
    componentName: string;
    /**
     * 文件名称
     */
    fileName: string;
    /**
     * 代码
     */
    code: string;
    /**
     * 样式文件
     */
    css?: string;
    /**
     * 低代码业务组件默认属性
     */
    defaultProps?: CompositeObject;
}

/**
 * 页面容器
 */
export interface PageSchema extends ContainerSchema {
    componentName: 'Page';
}

/**
 * 低代码业务组件容器
 */
export interface ComponentSchema extends ContainerSchema {
    componentName: 'Component';
}

/**
 * 区块容器
 */
export interface BlockSchema extends ContainerSchema {
    componentName: 'Block';
}

/**
 * @todo
 */
export type RootSchema = PageSchema | ComponentSchema | BlockSchema;

/**
 * 应用描述
 */
export interface ProjectSchema {
    id?: string;
    /**
     * 当前应用协议版本号
     */
    version: string;
    /**
     * 当前应用所有组件映射关系
     */
    componentsMap: ComponentsMap;
    /**
     * 描述应用所有页面、低代码组件的组件树
     * 低代码业务组件树描述
     * 是长度固定为1的数组, 即数组内仅包含根容器的描述（低代码业务组件容器类型）
     */
    componentsTree: RootSchema[];
    /**
     * 应用范围内的全局自定义函数或第三方工具类扩展
     */
    utils?: UtilsMap;
    /**
     * 应用范围内的全局常量
     */
    constants?: JSONObject;
    /**
     * 应用范围内的全局样式
     */
    css?: string;
    /**
     * 当前应用配置信息
     */
    config?: AppConfig | Record<string, any>;
    /**
     * 当前应用元数据信息
     */
    meta?: Record<string, any>;
}

export function isNodeSchema(data: any): data is NodeSchema {
    return data && data.componentName;
}

export function isProjectSchema(data: any): data is ProjectSchema {
    return data && data.componentsTree;
}
