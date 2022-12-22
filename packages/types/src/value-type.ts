import { NodeSchema } from './schema';

/**
 * 变量表达式
 *
 * 表达式内通过 this 对象获取上下文
 */
export interface JSExpression {
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
 * @see https://lowcode-engine.cn/lowcode
 *
 * 保留与原组件属性、生命周期( React / 小程序)一致的输入参数，并给所有事件函数 binding 统一一致的上下文（当前组件所在容器结构的 this 对象）
 */
export interface JSFunction {
    type: 'JSFunction';
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
 * 通常用于描述组件的某一个属性为 ReactNode 或 Function return ReactNode 的场景。
 */
export interface JSSlot {
    type: 'JSSlot';
    /**
     * 具体的值。
     */
    value: NodeSchema[];
    /**
     * 插槽名称
     */
    name?: string;
    /**
     * 插槽参数
     */
    params?: string[];
}

/**
 * JSON 基本类型
 */
export type JSONValue =
    | boolean
    | string
    | number
    | null
    | undefined
    | JSONArray
    | JSONObject;

export type JSONArray = JSONValue[];

export interface JSONObject {
    [key: string]: JSONValue;
}

/**
 * 复合类型
 */
export type CompositeValue =
    | JSONValue
    | JSExpression
    | JSFunction
    | JSSlot
    | CompositeArray
    | CompositeObject;

export type CompositeArray = CompositeValue[];

export interface CompositeObject {
    [key: string]: CompositeValue;
}

export function isJSExpression(data: any): data is JSExpression {
    return data && typeof data === 'object' && data.type === 'JSExpression';
}

export function isJSFunction(data: any): data is JSFunction {
    return data && typeof data === 'object' && data.type === 'JSFunction';
}

export function isJSSlot(data: any): data is JSSlot {
    return data && typeof data === 'object' && data.type === 'JSSlot';
}
