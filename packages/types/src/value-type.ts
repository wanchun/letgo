import type { IPublicTypeNodeData, IPublicTypeSlotSchema } from './schema';

/**
 * 变量表达式
 *
 * 表达式内通过 this 对象获取上下文
 */
export interface IPublicTypeJSExpression {
    type: 'JSExpression'
    /**
     * 表达式字符串
     */
    value: string
    /**
     * 模拟值
     */
    mock?: any
}

/**
 * 事件函数类型
 * @see https://lowcode-engine.cn/lowcode
 *
 * 保留与原组件属性、生命周期( React / 小程序)一致的输入参数，并给所有事件函数 binding 统一一致的上下文（当前组件所在容器结构的 this 对象）
 */
export interface IPublicTypeJSFunction {
    type: 'JSFunction'
    params?: string[]
    /**
     * 函数定义，或直接函数表达式
     */
    value: string
    /**
     * 模拟值
     */
    mock?: any
}

/**
 * Slot 函数类型
 *
 * 通常用于描述组件的某一个属性为 ReactNode 或 Function return ReactNode 的场景。
 */
export interface IPublicTypeJSSlot {
    type: 'JSSlot'
    /**
     * 具体的值。
     */
    value: IPublicTypeSlotSchema | IPublicTypeNodeData | IPublicTypeNodeData[]
    /**
     * 插槽名称
     */
    title?: string
    /**
     * 插槽名
     */
    name?: string
    /**
     * 插槽参数
     */
    params?: string[]
}

/**
 * JSON 基本类型
 */
export type IPublicTypeJSONValue =
    | boolean
    | string
    | number
    | null
    | undefined
    | IPublicTypeJSONArray
    | IPublicTypeJSONObject;

export type IPublicTypeJSONArray = IPublicTypeJSONValue[];

export interface IPublicTypeJSONObject {
    [key: string]: IPublicTypeJSONValue
}

/**
 * 复合类型
 */
export type IPublicTypeCompositeValue =
    | IPublicTypeJSONValue
    | IPublicTypeJSExpression
    | IPublicTypeJSFunction
    | IPublicTypeJSSlot
    | IPublicTypeCompositeArray
    | IPublicTypeCompositeObject;

export type IPublicTypeCompositeArray = IPublicTypeCompositeValue[];

export interface IPublicTypeCompositeObject {
    [key: string]: IPublicTypeCompositeValue
}

export function isJSExpression(data: any): data is IPublicTypeJSExpression {
    return data && typeof data === 'object' && data.type === 'JSExpression';
}

export function isJSFunction(data: any): data is IPublicTypeJSFunction {
    return data && typeof data === 'object' && data.type === 'JSFunction';
}

export function isJSSlot(data: any): data is IPublicTypeJSSlot {
    return data && typeof data === 'object' && data.type === 'JSSlot';
}
