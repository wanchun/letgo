import type { IPublicTypeNodeData, IPublicTypeSlotSchema } from '.';

/**
 * 变量表达式
 */
export interface IPublicTypeJSExpression {
    type: 'JSExpression';
    /**
     * 表达式字符串
     */
    value: string;
    /**
     * 模拟值
     */
    mock?: any;
}

/**
 * 事件函数类型
 */
export interface IPublicTypeJSFunction {
    type: 'JSFunction';
    params?: string[];
    /**
     * 函数定义，或直接函数表达式
     */
    value: string;
    /**
     * 模拟值
     */
    mock?: any;
}

/**
 * Slot 函数类型
 *
 * 通常用于描述组件的某一个属性为 VNode 或 Function return VNode 的场景。
 */
export interface IPublicTypeJSSlot {
    type: 'JSSlot';
    /**
     * 具体的值。
     */
    value: IPublicTypeSlotSchema | IPublicTypeNodeData | IPublicTypeNodeData[];
    /**
     * 插槽名称
     */
    title?: string;
    /**
     * 插槽名
     */
    name?: string;
    /**
     * 插槽参数
     */
    params?: string[];

    ref?: string;
}

/**
 * 日期类型
 */

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
    [key: string]: IPublicTypeJSONValue;
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
    [key: string]: IPublicTypeCompositeValue;
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
